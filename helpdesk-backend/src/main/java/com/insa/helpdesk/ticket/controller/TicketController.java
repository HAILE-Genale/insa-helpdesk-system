package com.insa.helpdesk.ticket.controller;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.ticket.dto.CreateTicketRequest;
import com.insa.helpdesk.ticket.dto.TicketResponseDto;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.service.TicketService;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST endpoints for tickets (FRD 3.5 "Assignment and Routing").
 *
 * <p>Creating a ticket triggers auto-routing to a team/agent. Assignment endpoints
 * require the {@code TICKET_ASSIGN} authority.</p>
 */
@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /** List all tickets. */
    @GetMapping
    public ApiResponse<List<TicketResponseDto>> listTickets() {
        List<TicketResponseDto> data = ticketService.getAllTickets().stream()
                .map(this::toResponseDto)
                .toList();
        return ApiResponse.success(data, "Tickets");
    }

    /** Get a single ticket by id. */
    @GetMapping("/{id}")
    public ApiResponse<TicketResponseDto> getTicket(@PathVariable Long id) {
        return ApiResponse.success(toResponseDto(ticketService.getTicket(id)), "Ticket");
    }

    /**
     * Create a new ticket. The ticket is auto-routed: its category is matched to a
     * team's routing rules (default team if no match) and assigned to the
     * least-loaded agent on that team.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('TICKET_CREATE')")
    public ApiResponse<TicketResponseDto> createTicket(@RequestBody CreateTicketRequest request,
                                                       Principal principal) {
        // NOTE(auth): JWT is currently placeholder, so principal may be null.
        User reporter = principal != null
                ? User.builder().username(principal.getName()).build()
                : User.builder().username("system").build();

        Ticket created = ticketService.createTicket(request, reporter);
        return ApiResponse.success(toResponseDto(created), "Ticket created");
    }

    /** The current agent's assigned tickets (their queue). */
    @GetMapping("/my-queue")
    public ApiResponse<List<TicketResponseDto>> myQueue(Principal principal) {
        // NOTE(auth): with placeholder JWT, fall back to agent id 0 -> empty queue.
        // Once real auth lands, resolve the actual agent id from the principal.
        Long agentId = 0L;
        if (principal != null && principal.getName() != null && !principal.getName().equals("anonymousUser")) {
            // TODO(auth): look up the user by username to get the real id.
        }
        List<TicketResponseDto> data = ticketService.getAgentQueue(agentId).stream()
                .map(this::toResponseDto)
                .toList();
        return ApiResponse.success(data, "My queue");
    }

    /** Assign (or reassign) a ticket to a specific agent. */
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('TICKET_ASSIGN')")
    public ApiResponse<TicketResponseDto> assignTicket(@PathVariable Long id,
                                                       @RequestBody AssignRequest body,
                                                       Principal principal) {
        User changedBy = principal != null
                ? User.builder().username(principal.getName()).build()
                : User.builder().username("system").build();
        Ticket updated = ticketService.assignTicket(id, body.getAssigneeId(), changedBy);
        return ApiResponse.success(toResponseDto(updated), "Ticket assigned");
    }

    /** Maps a Ticket entity to the response DTO. */
    private TicketResponseDto toResponseDto(Ticket t) {
        return TicketResponseDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .category(t.getCategory())
                .build();
    }

    /** Simple request body: { "assigneeId": 123 } */
    public static class AssignRequest {
        private Long assigneeId;
        public Long getAssigneeId() { return assigneeId; }
        public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    }
}