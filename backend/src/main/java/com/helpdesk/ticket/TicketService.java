package com.helpdesk.ticket;

import com.helpdesk.ticket.dto.CreateTicketRequest;
import com.helpdesk.ticket.dto.UpdateStatusRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TicketService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    /**
     * FR-007: create a ticket.
     * FR-008: auto-generate a unique ticket number, e.g. TKT-20260723-0001.
     * FR-009: capture full ticket details.
     * FR-010: record the submission channel (portal or email).
     */
    @Transactional
    public Ticket createTicket(CreateTicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setSubCategory(request.getSubCategory());
        ticket.setPriority(request.getPriority());
        ticket.setChannel(request.getChannel() != null ? request.getChannel() : TicketChannel.WEB_PORTAL);
        ticket.setRequesterName(request.getRequesterName());
        ticket.setRequesterEmail(request.getRequesterEmail());
        ticket.setRequesterDepartment(request.getRequesterDepartment());
        ticket.setAttachmentUrl(request.getAttachmentUrl());
        ticket.setStatus(TicketStatus.NEW);
        ticket.setTicketNumber(generateTicketNumber());

        // FR-023 / FR-025: use the requester's chosen team if given, otherwise
        // auto-route based on category.
        ticket.setAssignedTeam(
                request.getTeam() != null ? request.getTeam() : routeByCategory(request.getCategory())
        );

        return ticketRepository.save(ticket);
    }

    /**
     * FR-025: automatic routing to a service team based on category, used when
     * the requester doesn't explicitly pick a team.
     */
    private ServiceTeam routeByCategory(String category) {
        if (category == null) {
            return ServiceTeam.SOFTWARE;
        }
        String c = category.trim().toLowerCase();
        if (c.contains("network")) {
            return ServiceTeam.NETWORKING;
        } else if (c.contains("electric")) {
            return ServiceTeam.ELECTRICIAN;
        } else if (c.contains("hardware")) {
            return ServiceTeam.HARDWARE;
        } else if (c.contains("av") || c.contains("audio") || c.contains("multimedia")
                || c.contains("server") || c.contains("lab")) {
            return ServiceTeam.AV_SYSTEMS;
        } else if (c.contains("software")) {
            return ServiceTeam.SOFTWARE;
        }
        return ServiceTeam.SOFTWARE;
    }

    /**
     * FR-008: generates a unique, human-readable ticket number scoped to the current day,
     * e.g. TKT-20260723-0001, TKT-20260723-0002, ...
     */
    private String generateTicketNumber() {
        String datePart = LocalDate.now().format(DATE_FMT);
        String prefix = "TKT-" + datePart + "-";

        long countToday = ticketRepository.countByTicketNumberStartingWith(prefix);
        String candidate;
        long next = countToday + 1;

        // Guard against a rare race producing a duplicate; loop until we find a free number.
        do {
            candidate = prefix + String.format("%04d", next);
            next++;
        } while (ticketRepository.findByTicketNumber(candidate).isPresent());

        return candidate;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByTeam(ServiceTeam team) {
        return ticketRepository.findByAssignedTeam(team);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + id));
    }

    public Ticket getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketNumber));
    }

    /**
     * FR-011: agents update ticket status.
     */
    @Transactional
    public Ticket updateStatus(Long id, UpdateStatusRequest request) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(request.getStatus());
        if (request.getAgentName() != null && !request.getAgentName().isBlank()) {
            ticket.setAssignedAgent(request.getAgentName());
        }
        if (request.getTeam() != null) {
            ticket.setAssignedTeam(request.getTeam());
        }
        // request.getNote() can be persisted to a separate TicketActivity/comment table (FR-012/014)
        return ticketRepository.save(ticket);
    }
}
