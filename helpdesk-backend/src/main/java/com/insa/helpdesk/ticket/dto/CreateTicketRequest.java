package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {
    private String title;
    private String description;
    private String priority;
    private String category;
    private String department;
    private String location;
    private String phone;
    private String assetTag;
    private String errorMessage;
    private LocalDate issueStartDate;
}
