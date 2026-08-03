package com.helpdesk.ticket;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Core ticket entity.
 *
 * Covers:
 *  FR-007 Users can create support tickets
 *  FR-008 Unique, auto-generated ticket number
 *  FR-009 Ticket details: title, description, category, priority, attachment, requester info
 *  FR-010 Channel of submission: web portal or email
 *  FR-011 Agents can update ticket status
 */
@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FR-008: unique, human-readable ticket number, e.g. TKT-20260723-0001
    @Column(name = "ticket_number", nullable = false, unique = true, length = 30)
    private String ticketNumber;

    // FR-009: title / short summary
    @Column(nullable = false, length = 200)
    private String title;

    // FR-009: full description of the issue
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    // FR-009 / 3.3: category, e.g. Hardware > Laptop, Software > ERP
    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    // FR-009: priority level
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    // FR-011: current status in the ticket lifecycle
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status = TicketStatus.NEW;

    // FR-010: how the ticket was submitted
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketChannel channel;

    // FR-009: requester information
    @Column(name = "requester_name", nullable = false, length = 150)
    private String requesterName;

    @Column(name = "requester_email", nullable = false, length = 150)
    private String requesterEmail;

    @Column(name = "requester_department", length = 150)
    private String requesterDepartment;

    // FR-009: optional attachment (stored file path / URL; actual file handled by a storage service)
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    // FR-023: which service team this ticket is routed to
    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_team", nullable = false, length = 30)
    private ServiceTeam assignedTeam;

    // FR-023/026: individual agent assignment within the team
    @Column(name = "assigned_agent", length = 150)
    private String assignedAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = TicketStatus.NEW;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
