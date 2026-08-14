package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDto {
    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String category;
    private String department;
    private String location;
    private String phone;
    private String assetTag;
    private String errorMessage;
    private LocalDate issueStartDate;

    // Reporter info
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;

    // Assignee info
    private Long assigneeId;
    private String assigneeName;
    private String assigneeEmail;

    // SLA info
    private ZonedDateTime slaDeadline;
    private boolean slaViolated;
    private ZonedDateTime slaBreachedAt;
    private boolean slaWarningSent;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    /** Whether feedback has been submitted for this ticket. */
    private Boolean hasFeedback;
}