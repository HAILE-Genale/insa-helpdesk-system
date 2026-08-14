package com.insa.helpdesk.feedback.entity;

import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

/**
 * End-user feedback on a resolved/closed ticket (FRD 3.5).
 *
 * <p>When a user submits feedback, a notification is sent to both the
 * assigned agent and the manager of the agent's team.</p>
 */
@Entity
@Table(name = "ticket_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    /** The end-user who submitted the feedback. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The agent who handled the ticket (the ticket's assignee). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agent_id", nullable = false)
    private User agent;

    /** Star rating: 1 (worst) to 5 (best). */
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
