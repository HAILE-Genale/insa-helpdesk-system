package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String category;
}
