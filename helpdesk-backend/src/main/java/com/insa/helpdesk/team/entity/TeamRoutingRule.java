package com.insa.helpdesk.team.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * A routing rule (FRD 3.5).
 *
 * <p>Maps one ticket {@code category} to a {@link SupportTeam}. When a ticket is
 * created, its category is matched here to decide which team should handle it.
 * Each category can be routed to at most one team (unique constraint).</p>
 */
@Entity
@Table(name = "team_routing_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRoutingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private SupportTeam team;

    @Column(nullable = false, unique = true)
    private String category;
}