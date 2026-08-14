package com.insa.helpdesk.ticket.repository;

import com.insa.helpdesk.ticket.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access for ticket history entries (FRD 3.5).
 *
 * <p>Records changes to a ticket over time — e.g. who was assigned and by whom —
 * so there is an audit trail of each assignment.</p>
 */
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    java.util.List<TicketHistory> findByTicketIdOrderByChangedAtAsc(Long ticketId);
}