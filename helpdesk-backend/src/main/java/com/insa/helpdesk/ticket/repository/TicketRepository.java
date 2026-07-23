package com.insa.helpdesk.ticket.repository;

import com.insa.helpdesk.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReporterId(Long reporterId);
    List<Ticket> findByAssigneeId(Long assigneeId);
}
