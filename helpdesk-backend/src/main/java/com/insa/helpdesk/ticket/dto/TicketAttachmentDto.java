package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachmentDto {
    private Long id;
    private Long ticketId;
    private String fileName;
    private String fileUrl;
    private String fileType;
}
