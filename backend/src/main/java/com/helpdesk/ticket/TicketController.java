package com.helpdesk.ticket;

import com.helpdesk.ticket.dto.CreateTicketRequest;
import com.helpdesk.ticket.dto.TicketResponse;
import com.helpdesk.ticket.dto.UpdateStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API for the Ticket / Incident Management module (FR-007 to FR-011).
 * Consumed by the Next.js frontend.
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:3000}")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // FR-007 / FR-008 / FR-009 / FR-010: create a ticket from the web portal
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        Ticket created = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TicketResponse.fromEntity(created));
    }

    @GetMapping
    public List<TicketResponse> getAllTickets() {
        return ticketService.getAllTickets().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(TicketResponse.fromEntity(ticketService.getTicketById(id)));
    }

    @GetMapping("/by-number/{ticketNumber}")
    public ResponseEntity<TicketResponse> getByTicketNumber(@PathVariable String ticketNumber) {
        return ResponseEntity.ok(TicketResponse.fromEntity(ticketService.getTicketByNumber(ticketNumber)));
    }

    // Team dashboard: e.g. GET /api/tickets/by-team/NETWORKING
    @GetMapping("/by-team/{team}")
    public List<TicketResponse> getByTeam(@PathVariable ServiceTeam team) {
        return ticketService.getTicketsByTeam(team).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // FR-011: agent updates ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
                                                        @Valid @RequestBody UpdateStatusRequest request) {
        Ticket updated = ticketService.updateStatus(id, request);
        return ResponseEntity.ok(TicketResponse.fromEntity(updated));
    }
}
