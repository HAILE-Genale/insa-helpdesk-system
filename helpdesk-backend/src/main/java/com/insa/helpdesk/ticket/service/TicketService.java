package com.insa.helpdesk.ticket.service;

import com.insa.helpdesk.assignment.AssignmentService;
import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.ticket.dto.CommentRequest;
import com.insa.helpdesk.ticket.dto.CreateTicketRequest;
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

        // Generate human-readable ticket number after save so we have the DB id.
        saved.setTicketNumber(String.format("TK-%05d", saved.getId()));
        saved = ticketRepository.save(saved);

        // Auto-routing: match category to a team/agent.
        return assignmentService.autoRouteOnCreate(saved, persistedReporter);
    }

    /** Update a ticket's status and record the change in history. */
    @Transactional
    public Ticket updateStatus(Long ticketId, String newStatus, User changedBy) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        historyRepository.save(TicketHistory.builder()
                .ticket(saved)
                .changedBy(changedBy)
                .fieldName("status")
                .oldValue(oldStatus)
                .newValue(newStatus)
                .build());

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

        return commentRepository.save(comment);
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
