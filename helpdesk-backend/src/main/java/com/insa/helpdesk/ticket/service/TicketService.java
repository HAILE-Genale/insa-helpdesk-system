package com.insa.helpdesk.ticket.service;

import com.insa.helpdesk.assignment.AssignmentService;
import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.ticket.dto.CreateTicketRequest;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Ticket creation and retrieval (FRD 3.5).
 *
 * <p>Creating a ticket triggers automatic assignment via {@link AssignmentService}:
 * the ticket is routed to the team that owns its category (falling back to the
 * default team) and assigned to the least-loaded agent on that team.</p>
 */
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final AssignmentService assignmentService;
    private final UserRepository userRepository;

    /** Create a new ticket and auto-route it to a team/agent. */
    @Transactional
    public Ticket createTicket(CreateTicketRequest request, User reporter) {
        // Resolve the reporter from the DB so the saved ticket references a real,
        // persisted user (a transient User would violate the not-null FK).
        User persistedReporter = null;
        if (reporter != null && reporter.getId() != null) {
            persistedReporter = userRepository.findById(reporter.getId()).orElse(null);
        }
        if (persistedReporter == null && reporter != null && reporter.getUsername() != null) {
            persistedReporter = userRepository.findByUsername(reporter.getUsername()).orElse(null);
        }
        if (persistedReporter == null) {
            persistedReporter = userRepository.findByUsername("admin")
                    .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status("OPEN")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .category(request.getCategory())
                .reporter(persistedReporter)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Auto-routing: match category to a team, then to the least-loaded agent.
        return assignmentService.autoRouteOnCreate(saved, persistedReporter);
    }

    /** Fetch a single ticket, or throw 404. */
    @Transactional(readOnly = true)
    public Ticket getTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    /** List all tickets. */
    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
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
}