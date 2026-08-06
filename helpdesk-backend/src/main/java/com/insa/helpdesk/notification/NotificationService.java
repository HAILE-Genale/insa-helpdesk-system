package com.insa.helpdesk.notification;

import com.insa.helpdesk.common.email.EmailService;
import com.insa.helpdesk.notification.entity.Notification;
import com.insa.helpdesk.notification.repository.NotificationRepository;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Notifications for agents (FRD 3.5, FR-027).
 *
 * <p>Notifies an agent when a ticket is assigned to them: a persistent in-app
 * {@link Notification} row is recorded, and an email is attempted via
 * {@link EmailService}. Email failures are logged and do NOT block the assignment —
 * this mirrors the password-reset email pattern.</p>
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    /** Notify an agent that a ticket was assigned to them. */
    @Transactional
    public void notifyAssignment(Ticket ticket, User assignee, User changedBy) {
        if (assignee == null) {
            return;
        }

        String changedByName = changedBy != null ? changedBy.getUsername() : "system";
        String message = String.format(
                "You have been assigned ticket #%d \"%s\" by %s.",
                ticket.getId(), ticket.getTitle(), changedByName);

        // Persistent in-app notification (audit trail / unread badge).
        notificationRepository.save(
                Notification.builder()
                        .recipient(assignee)
                        .ticket(ticket)
                        .type("ASSIGNED")
                        .message(message)
                        .build());

        // Attempt an email. Fails silently-but-logged, never blocks assignment.
        try {
            if (assignee.getEmail() != null && !assignee.getEmail().isBlank()) {
                emailService.send(
                        assignee.getEmail(),
                        "INSA Help Desk — New Ticket Assigned",
                        message);
            }
        } catch (Exception e) {
            logger.warn("Could not send assignment email to {}: {}", assignee.getEmail(), e.getMessage());
        }
    }

    /** Unread notifications for a user. */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadForUser(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFalse(userId);
    }

    /** Mark a notification as read. */
    @Transactional
    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId)
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }
}