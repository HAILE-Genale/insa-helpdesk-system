package com.insa.helpdesk.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private OffsetDateTime createdAt;
    private Long ticketId;
    private String ticketNumber;
    private String ticketTitle;
    private String priority;

    // SLA info for SLA breach notifications
    private ZonedDateTime slaDeadline;
    private boolean slaViolated;
}
