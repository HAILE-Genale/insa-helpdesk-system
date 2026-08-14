package com.insa.helpdesk.feedback.repository;

import com.insa.helpdesk.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access for ticket feedback.
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
    List<Feedback> findByAgentIdOrderByCreatedAtDesc(Long agentId);
    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByTicketId(Long ticketId);
}
