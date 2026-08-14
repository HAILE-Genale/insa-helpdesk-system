package com.insa.helpdesk.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for submitting feedback on a ticket.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequestDto {
    /** Star rating: 1 (worst) to 5 (best). */
    private Integer rating;
    /** Optional written feedback / comments. */
    private String comment;
}
