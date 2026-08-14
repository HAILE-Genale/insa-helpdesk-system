package com.insa.helpdesk.ticket.repository;

import com.insa.helpdesk.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReporterId(Long reporterId);
    List<Ticket> findByAssigneeId(Long assigneeId);

    /**
     * All tickets that were originally routed to a given team.
     * Uses the team_id column stamped at creation time — survives reassignment
     * to agents outside the team.
     */
    List<Ticket> findByTeamId(Long teamId);

    /** Active tickets (OPEN, IN_PROGRESS, ON_HOLD) for SLA monitoring. */
    List<Ticket> findByStatusIn(Collection<String> statuses);
}
