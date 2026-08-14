package com.insa.helpdesk.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * Response body for feedback submissions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDto {
    private Long id;
    private Long ticketId;
    private String ticketNumber;
    private Long userId;
    private String userName;
    private Long agentId;
    private String agentName;
    private Integer rating;
    private String comment;
    private ZonedDateTime createdAt;
}
