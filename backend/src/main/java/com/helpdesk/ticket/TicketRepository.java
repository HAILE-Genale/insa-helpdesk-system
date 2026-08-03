package com.helpdesk.ticket;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAssignedTeam(ServiceTeam assignedTeam);

    List<Ticket> findByRequesterEmail(String requesterEmail);

    // Used to build the next sequential number for FR-008
    long countByTicketNumberStartingWith(String prefix);
}
