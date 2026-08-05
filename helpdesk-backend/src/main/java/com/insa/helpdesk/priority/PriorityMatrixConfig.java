package com.insa.helpdesk.priority;

import jakarta.persistence.*;
import lombok.*;

/**
 * One cell of the configurable priority matrix (FR-022): a given impact + urgency
 * combination maps to a resulting priority level.
 *
 * Mirrors the ERD's PRIORITY_MATRIX table (impact, urgency, resulting_priority).
 */
@Entity
@Table(name = "priority_matrix",
       uniqueConstraints = @UniqueConstraint(name = "uk_priority_matrix_impact_urgency",
                                             columnNames = {"impact", "urgency"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriorityMatrixConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "impact", nullable = false)
    private Impact impact;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency", nullable = false)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(name = "resulting_priority", nullable = false)
    private PriorityLevel resultingPriority;
}
