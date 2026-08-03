package com.insa.helpdesk.priority;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Full representation of the priority matrix (FR-022).
 * Returned by GET /priorities/matrix and accepted by PUT /priorities/matrix.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriorityMatrixDto {

    private List<PriorityMatrixRow> rows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriorityMatrixRow {
        private Impact impact;
        private Urgency urgency;
        private PriorityLevel resultingPriority;
    }
}
