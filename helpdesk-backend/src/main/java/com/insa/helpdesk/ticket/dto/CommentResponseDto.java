package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {
    private Long id;
    private Long ticketId;
    private Long authorId;
    private String authorName;
    private String content;
    private boolean internal;
    private ZonedDateTime createdAt;
}
