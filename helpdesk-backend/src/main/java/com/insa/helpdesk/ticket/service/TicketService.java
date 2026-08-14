package com.insa.helpdesk.ticket.service;

import com.insa.helpdesk.assignment.AssignmentService;
import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.notification.NotificationService;
import com.insa.helpdesk.sla.SlaService;
import com.insa.helpdesk.ticket.dto.CommentRequest;
import com.insa.helpdesk.ticket.dto.CreateTicketRequest;
import com.insa.helpdesk.ticket.dto.EmailTicketRequest;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketComment;
import com.insa.helpdesk.ticket.entity.TicketHistory;
import com.insa.helpdesk.ticket.repository.TicketCommentRepository;
import com.insa.helpdesk.ticket.repository.TicketHistoryRepository;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * Ticket creation, retrieval, status updates, and comments (FRD 3.5).
 */
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final AssignmentService assignmentService;
    private final UserRepository userRepository;
    private final com.insa.helpdesk.team.repository.SupportTeamRepository teamRepository;
    private final jakarta.persistence.EntityManager entityManager;
    private final NotificationService notificationService;
    private final SlaService slaService;

    /** Create a new ticket and auto-route it to a team/agent. */
    @Transactional
    public Ticket createTicket(CreateTicketRequest request, User reporter) {
        // Resolve the reporter from the DB so the saved ticket references a persisted user.
        User persistedReporter = resolveReporter(reporter);

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status("OPEN")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .category(request.getCategory())
                .department(request.getDepartment())
                .location(request.getLocation())
                .phone(request.getPhone())
                .assetTag(request.getAssetTag())
                .errorMessage(request.getErrorMessage())
                .issueStartDate(request.getIssueStartDate())
                .reporter(persistedReporter)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Generate a unique ticket number from a dedicated DB sequence so it never
        // collides regardless of what other rows hold (avoids uq_ticket_number violations).
        Long seqVal = ((Number) entityManager
                .createNativeQuery("SELECT nextval('ticket_number_seq')")
                .getSingleResult()).longValue();
        saved.setTicketNumber(String.format("TK-%05d", seqVal));
        saved = ticketRepository.save(saved);

        // Auto-routing: match category to a team/agent.
        Ticket routed = assignmentService.autoRouteOnCreate(saved, persistedReporter);

        // Apply SLA deadline based on priority.
        try {
            routed = slaService.applySlaDeadline(routed);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TicketService.class)
                    .warn("Could not apply SLA deadline for ticket {}: {}", routed.getId(), e.getMessage());
        }

        // Notify agents (especially when the ticket was created via inbound email).
        try {
            notificationService.notifyNewTicketForAgents(routed);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TicketService.class)
                    .warn("Could not notify agents about new ticket {}: {}", routed.getId(), e.getMessage());
        }

        return routed;
    }

    /**
     * Create a ticket from an inbound email (mail-to-ticket bridge).
     * <p>Resolves the reporter by email address; if no matching user exists, falls
     * back to the admin account so the ticket is still created and routed.</p>
     */
    @Transactional
    public Ticket createTicketFromEmail(EmailTicketRequest request) {
        if (request == null || request.getSubject() == null || request.getSubject().isBlank()) {
            throw new IllegalArgumentException("Email subject is required to create a ticket");
        }

        User reporter = resolveReporterByEmail(request.getFromEmail());

        CreateTicketRequest createRequest = CreateTicketRequest.builder()
                .title(truncateTitle(request.getSubject()))
                .description(request.getBody() != null ? request.getBody() : request.getSubject())
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .category(request.getCategory())
                .build();

        return createTicket(createRequest, reporter);
    }

    /** Update a ticket's status and record the change in history. */
    @Transactional
    public Ticket updateStatus(Long ticketId, String newStatus, User changedBy) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String oldStatus = ticket.getStatus();
        if (oldStatus != null && oldStatus.equals(newStatus)) {
            return ticket;
        }
        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        // Clear SLA violation when the ticket reaches a terminal status.
        try {
            slaService.clearViolationOnResolve(saved);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TicketService.class)
                    .warn("Could not clear SLA violation for ticket {}: {}", saved.getId(), e.getMessage());
        }

        historyRepository.save(TicketHistory.builder()
                .ticket(saved)
                .changedBy(changedBy)
                .fieldName("status")
                .oldValue(oldStatus)
                .newValue(newStatus)
                .build());

        // Notify the reporter that their ticket's status changed.
        try {
            notificationService.notifyStatusUpdate(saved, oldStatus, newStatus, changedBy);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TicketService.class)
                    .warn("Could not send status update notification for ticket {}: {}", saved.getId(), e.getMessage());
        }

        return saved;
    }

    /** Add a comment or internal note to a ticket. */
    @Transactional
    public TicketComment addComment(Long ticketId, CommentRequest request, User author) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(request.getContent())
                .internal(request.isInternal())
                .createdAt(ZonedDateTime.now())
                .build();

        TicketComment saved = commentRepository.save(comment);

        // Notify the other party (reporter or agent) about the new reply.
        try {
            notificationService.notifyNewComment(saved);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TicketService.class)
                    .warn("Could not send comment notification for ticket {}: {}", ticket.getId(), e.getMessage());
        }

        return saved;
    }

    /** Fetch comments for a ticket (internal notes excluded for non-agents via controller). */
    @Transactional(readOnly = true)
    public List<TicketComment> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    /** Fetch a single ticket, or throw 404. */
    @Transactional(readOnly = true)
    public Ticket getTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    /** List all tickets (admin/agent view). */
    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /** All tickets in the team(s) managed by this user (manager-scoped view). */
    @Transactional(readOnly = true)
    public List<Ticket> getTeamTickets(Long managerId) {
        return teamRepository.findByManagerId(managerId).stream()
                .flatMap(team -> ticketRepository.findByTeamId(team.getId()).stream())
                .distinct()
                .toList();
    }

    /** Tickets submitted by a specific user (portal "My Tickets"). */
    @Transactional(readOnly = true)
    public List<Ticket> getMyTickets(Long reporterId) {
        return ticketRepository.findByReporterId(reporterId);
    }

    /** Tickets assigned to a specific agent (their queue). */
    @Transactional(readOnly = true)
    public List<Ticket> getAgentQueue(Long agentId) {
        return ticketRepository.findByAssigneeId(agentId);
    }

    /** Manually assign (or reassign) a ticket to a specific agent. */
    @Transactional
    public Ticket assignTicket(Long ticketId, Long agentId, User changedBy) {
        return assignmentService.assignToAgent(ticketId, agentId, changedBy);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private User resolveReporterByEmail(String email) {
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email.trim().toLowerCase())
                    .orElseGet(() -> userRepository.findByUsername("admin")
                            .orElseThrow(() -> new ResourceNotFoundException("No reporter resolved and no admin fallback available")));
        }
        return userRepository.findByUsername("admin")
                .orElseThrow(() -> new ResourceNotFoundException("No reporter resolved and no admin fallback available"));
    }

    private String truncateTitle(String title) {
        if (title == null) return "Email Request";
        return title.length() > 200 ? title.substring(0, 200) : title;
    }

    private User resolveReporter(User reporter) {
        // Try by ID first (most reliable)
        if (reporter != null && reporter.getId() != null) {
            return userRepository.findById(reporter.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reporter not found with id: " + reporter.getId()));
        }
        // Try by username
        if (reporter != null && reporter.getUsername() != null
                && !"system".equals(reporter.getUsername())) {
            return userRepository.findByUsername(reporter.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Reporter not found: " + reporter.getUsername()));
        }
        // Last resort: admin fallback (only for system/anonymous calls)
        return userRepository.findByUsername("admin")
                .orElseThrow(() -> new ResourceNotFoundException("No reporter resolved and no admin fallback available"));
    }
}
