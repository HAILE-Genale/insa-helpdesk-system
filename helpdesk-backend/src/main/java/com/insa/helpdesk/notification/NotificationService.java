package com.insa.helpdesk.notification;

import com.insa.helpdesk.common.email.EmailService;
import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.notification.dto.NotificationResponseDto;
import com.insa.helpdesk.notification.entity.Notification;
import com.insa.helpdesk.notification.repository.NotificationRepository;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketComment;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * Notifications for agents and portal users (FRD 3.5, FR-027).
 *
 * <p>Notifies a recipient when a ticket is assigned, a new comment/reply is added,
 * a ticket status changes, or a new ticket is created (e.g. via inbound email).
 * A persistent in-app {@link Notification} row is recorded, an SSE event is sent
 * to connected browsers, and where relevant an email is attempted via
 * {@link EmailService}. Email failures are logged and do not block the operation.</p>
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final NotificationRealtimeService realtimeService;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Value("${app.mail.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    /**
     * Notify all HELPDESK_MANAGERs (fallback SYSTEM_ADMINs) that a ticket's SLA
     * has been breached. Delivered in real time via SSE.
     */
    @Transactional
    public void notifySlaBreached(Ticket ticket) {
        if (ticket == null) return;
        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();
        String title = "🚨 SLA BREACHED";
        String message = String.format(
                "%s - %s (%s priority) has breached its SLA deadline of %s. Immediate action required.",
                ticketRef, ticket.getTitle(), ticket.getPriority(),
                ticket.getSlaDeadline() != null ? ticket.getSlaDeadline().toString() : "unknown");

        List<User> recipients = userRepository.findByRoleNameAndActiveTrue("HELPDESK_MANAGER");
        if (recipients.isEmpty()) {
            recipients = userRepository.findByRoleNameAndActiveTrue("SYSTEM_ADMIN");
        }
        for (User manager : recipients) {
            createNotification(manager, ticket, title, "SLA_BREACHED", message);
        }

        // Also notify the assigned agent so they know their ticket breached.
        if (ticket.getAssignee() != null) {
            createNotification(ticket.getAssignee(), ticket, title, "SLA_BREACHED", message);
        }
    }

    /**
     * Notify the assigned agent that their ticket is approaching its SLA deadline.
     * Delivered in real time via SSE.
     */
    @Transactional
    public void notifySlaBreachImminent(Ticket ticket, long minutesToDeadline) {
        if (ticket == null) return;
        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();
        String title = "⚠️ SLA BREACH IMMINENT";
        String message = String.format(
                "%s - %s (%s priority) will breach its SLA in %d minutes. Deadline: %s.",
                ticketRef, ticket.getTitle(), ticket.getPriority(), minutesToDeadline,
                ticket.getSlaDeadline() != null ? ticket.getSlaDeadline().toString() : "unknown");

        if (ticket.getAssignee() != null) {
            createNotification(ticket.getAssignee(), ticket, title, "SLA_BREACH_IMMINENT", message);
        }

        // Also notify managers so they can intervene early.
        List<User> recipients = userRepository.findByRoleNameAndActiveTrue("HELPDESK_MANAGER");
        if (recipients.isEmpty()) {
            recipients = userRepository.findByRoleNameAndActiveTrue("SYSTEM_ADMIN");
        }
        for (User manager : recipients) {
            createNotification(manager, ticket, title, "SLA_BREACH_IMMINENT", message);
        }
    }

    /** Notify an agent that a ticket was assigned to them. */
    @Transactional
    public void notifyAssignment(Ticket ticket, User assignee, User changedBy) {
        String changedByName = changedBy != null ? changedBy.getUsername() : "system";
        createAssignmentNotification(ticket, assignee, changedByName);
    }

    /** Notify an agent after the ticket assignment transaction has committed. */
    @Transactional
    public void notifyAssignment(Long ticketId, Long assigneeId, String changedByName) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeId));
        createAssignmentNotification(ticket, assignee, changedByName != null ? changedByName : "system");
    }

    /**
     * Notify the other party when a reply/comment is added to a ticket.
     * <p>If an agent replies → the reporter (user) is notified. If a user replies →
     * the assigned agent is notified. Internal notes only notify the assigned agent.</p>
     */
    @Transactional
    public void notifyNewComment(TicketComment comment) {
        if (comment == null || comment.getTicket() == null) {
            return;
        }
        Ticket ticket = comment.getTicket();
        User author = comment.getAuthor();
        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();

        // Internal notes are only visible to agents — notify the assignee, not the reporter.
        if (comment.isInternal()) {
            User assignee = ticket.getAssignee();
            if (assignee != null && !assignee.getId().equals(author.getId())) {
                createNotification(
                        assignee,
                        ticket,
                        "New Internal Note",
                        "NEW_INTERNAL_NOTE",
                        String.format("%s - %s added an internal note: %s.",
                                ticketRef, author.getUsername(), truncate(comment.getContent())));
            }
            return;
        }

        // Public reply: notify the party that did NOT write it.
        User assignee = ticket.getAssignee();
        User reporter = ticket.getReporter();

        if (isAgent(author)) {
            // Agent replied → notify the reporter.
            if (reporter != null && !reporter.getId().equals(author.getId())) {
                createNotification(
                        reporter,
                        ticket,
                        "New Reply on Your Ticket",
                        "NEW_COMMENT",
                        String.format("%s - %s replied to your ticket: %s.",
                                ticketRef, author.getUsername(), truncate(comment.getContent())));
            }
        } else {
            // User replied → notify the assigned agent (only if different from author).
            if (assignee != null && !assignee.getId().equals(author.getId())) {
                createNotification(
                        assignee,
                        ticket,
                        "New Reply from User",
                        "NEW_COMMENT",
                        String.format("%s - %s replied to the ticket: %s.",
                                ticketRef, author.getUsername(), truncate(comment.getContent())));
            }
        }
    }

    /** Notify the reporter that their ticket's status changed. */
    @Transactional
    public void notifyStatusUpdate(Ticket ticket, String oldStatus, String newStatus, User changedBy) {
        if (ticket == null || ticket.getReporter() == null) {
            return;
        }
        User reporter = ticket.getReporter();
        String changedByName = changedBy != null ? changedBy.getUsername() : "system";
        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();

        createNotification(
                reporter,
                ticket,
                "Ticket Status Updated",
                "STATUS_UPDATE",
                String.format("%s - Status changed from %s to %s by %s.",
                        ticketRef,
                        oldStatus != null ? oldStatus : "?",
                        newStatus != null ? newStatus : "?",
                        changedByName));
    }

    /**
     * Notify agents when a new ticket is created (e.g. via inbound email).
     * Notifies the assigned agent if present, otherwise all active agents in the
     * routed team.
     */
    @Transactional
    public void notifyNewTicketForAgents(Ticket ticket) {
        if (ticket == null) {
            return;
        }
        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();

        if (ticket.getAssignee() != null) {
            createNotification(
                    ticket.getAssignee(),
                    ticket,
                    "New Ticket Created",
                    "NEW_TICKET",
                    String.format("%s - %s (%s priority) was created and assigned to you.",
                            ticketRef, ticket.getTitle(), ticket.getPriority()));
            return;
        }

        // No assignee yet — notify all active members of the routed team.
        if (ticket.getTeam() != null) {
            ticket.getTeam().getMembers().stream()
                    .map(member -> {
                        try {
                            return member.getUser();
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(user -> user != null && user.isActive())
                    .forEach(member -> createNotification(
                            member,
                            ticket,
                            "New Ticket Created",
                            "NEW_TICKET",
                            String.format("%s - %s (%s priority) was created and needs assignment.",
                                    ticketRef, ticket.getTitle(), ticket.getPriority())));
        }
    }

    /**
     * Notify the assigned agent and the agent's team manager that the user
     * submitted feedback (rating) on a resolved/closed ticket.
     *
     * <p>The manager is resolved from the ticket's team. If the team has no
     * explicit manager, all HELPDESK_MANAGERs are notified as a fallback.</p>
     *
     * @param rating   Star rating given by the user (1–5).
     * @param comment  Optional comment text submitted by the user.
     */
    @Transactional
    public void notifyFeedbackReceived(Ticket ticket, User agent, User feedbackAuthor, int rating, String comment) {
        if (ticket == null || agent == null) return;

        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();
        String authorName = feedbackAuthor != null ? feedbackAuthor.getUsername() : "a user";
        String stars = "★".repeat(Math.max(0, Math.min(5, rating)));
        String commentText = (comment != null && !comment.isBlank()) ? truncate(comment) : "(no comment)";

        String title = "New Feedback Received";
        String message = String.format(
                "%s - %s gave you %d-star feedback (%s): \"%s\"",
                ticketRef, authorName, rating, stars, commentText);

        // 1. Notify the assigned agent directly
        createNotification(agent, ticket, title, "FEEDBACK_RECEIVED", message);

        // 2. Notify the team manager (from the ticket's team)
        User manager = null;
        if (ticket.getTeam() != null) {
            manager = ticket.getTeam().getManager();
        }
        if (manager != null && !manager.getId().equals(agent.getId())) {
            createNotification(manager, ticket, title, "FEEDBACK_RECEIVED", message);
        } else {
            // Fallback: notify all HELPDESK_MANAGERs
            List<User> managers = userRepository.findByRoleNameAndActiveTrue("HELPDESK_MANAGER");
            if (!managers.isEmpty()) {
                for (User m : managers) {
                    if (!m.getId().equals(agent.getId())) {
                        createNotification(m, ticket, title, "FEEDBACK_RECEIVED", message);
                    }
                }
            }
        }
    }

    private void createAssignmentNotification(Ticket ticket, User assignee, String changedByName) {
        if (assignee == null) {
            return;
        }

        String ticketRef = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "#" + ticket.getId();
        String title = "New Ticket Assigned";
        String message = String.format(
                "%s - %s (%s priority) was assigned to you by %s.",
                ticketRef, ticket.getTitle(), ticket.getPriority(), changedByName);

        createNotification(assignee, ticket, title, "NEW_TICKET_ASSIGNED", message);

        try {
            if (assignee.getEmail() != null && !assignee.getEmail().isBlank()) {
                emailService.send(
                        assignee.getEmail(),
                        "INSA Help Desk - New Ticket Assigned: " + ticketRef,
                        buildAssignmentEmailBody(ticket, ticketRef, changedByName));
            }
        } catch (Exception e) {
            logger.warn("Could not send assignment email to {}: {}", assignee.getEmail(), e.getMessage());
        }
    }

    /** Shared helper: persist a notification and push it via SSE. */
    private void createNotification(User recipient, Ticket ticket, String title, String type, String message) {
        if (recipient == null) {
            return;
        }
        Notification notification = notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .ticket(ticket)
                .title(title)
                .type(type)
                .message(message)
                .build());
        realtimeService.sendToUser(recipient.getId(), toDto(notification));
    }

    private String truncate(String value) {
        if (value == null) return "";
        return value.length() > 200 ? value.substring(0, 200) + "..." : value;
    }

    private boolean isAgent(User user) {
        if (user == null || user.getRole() == null) return false;
        String role = user.getRole().getName();
        return "HELPDESK_AGENT".equals(role)
                || "HELPDESK_MANAGER".equals(role)
                || "SYSTEM_ADMIN".equals(role);
    }

    /** Unread notifications for a user. */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadForUser(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFalse(userId);
    }

    /** Recent notification history for a user. */
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getRecentForUser(Long userId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    /** Unread notification count for a user. */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    /** Mark a notification as read. */
    @Transactional
    public NotificationResponseDto markRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        notification.setRead(true);
        return toDto(notificationRepository.save(notification));
    }

    /** Mark all unread notifications for a user as read. */
    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.findByRecipientIdAndReadFalse(userId)
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }

    public NotificationResponseDto toDto(Notification notification) {
        Ticket ticket = notification.getTicket();
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .ticketId(ticket != null ? ticket.getId() : null)
                .ticketNumber(ticket != null ? ticket.getTicketNumber() : null)
                .ticketTitle(ticket != null ? ticket.getTitle() : null)
                .priority(ticket != null ? ticket.getPriority() : null)
                .slaDeadline(ticket != null ? ticket.getSlaDeadline() : null)
                .slaViolated(ticket != null && ticket.isSlaViolated())
                .build();
    }

    private String buildAssignmentEmailBody(Ticket ticket, String ticketRef, String changedByName) {
        String description = ticket.getDescription() != null ? ticket.getDescription() : "";
        if (description.length() > 500) {
            description = description.substring(0, 500) + "...";
        }

        String ticketUrl = frontendBaseUrl.replaceAll("/+$", "") + "/agent/tickets/" + ticket.getId();
        return String.join("\n",
                "A support ticket has been assigned to you.",
                "",
                "Ticket: " + ticketRef,
                "Title: " + ticket.getTitle(),
                "Priority: " + ticket.getPriority(),
                "Assigned by: " + changedByName,
                "Assigned at: " + ZonedDateTime.now(),
                "",
                "Description:",
                description,
                "",
                "Open ticket: " + ticketUrl);
    }
}