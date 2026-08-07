package com.insa.helpdesk.ticket.repository;

import com.insa.helpdesk.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReporterId(Long reporterId);
    List<Ticket> findByAssigneeId(Long assigneeId);

    /** All tickets assigned to any agent in a given team. */
    @Query("SELECT t FROM Ticket t WHERE t.assignee.id IN " +
           "(SELECT tm.user.id FROM TeamMember tm WHERE tm.team.id = :teamId)")
    List<Ticket> findByTeamId(@Param("teamId") Long teamId);
}
