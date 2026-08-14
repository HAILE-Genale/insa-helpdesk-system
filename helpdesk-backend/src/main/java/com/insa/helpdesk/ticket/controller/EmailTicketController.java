package com.insa.helpdesk.ticket.controller;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.ticket.dto.EmailTicketRequest;
import com.insa.helpdesk.ticket.dto.TicketResponseDto;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Mail-to-ticket bridge endpoint.
 * <p>An email gateway (e.g. a mail server hook or a scheduled IMAP poller) POSTs
 * the sender address, subject, and body here. A ticket is created, auto-routed,
 * and the assigned agent / team is notified in-app and by email.</p>
 */
@RestController
@RequestMapping("/email-tickets")
@RequiredArgsConstructor
public class EmailTicketController {

    private final TicketService ticketService;

    @PostMapping
    public ApiResponse<TicketResponseDto> createFromEmail(@RequestBody EmailTicketRequest request) {
        Ticket created = ticketService.createTicketFromEmail(request);
        return ApiResponse.success(toResponseDto(created), "Ticket created from email");
    }

    private TicketResponseDto toResponseDto(Ticket t) {
        TicketResponseDto dto = TicketResponseDto.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .category(t.getCategory())
                .department(t.getDepartment())
                .location(t.getLocation())
                .phone(t.getPhone())
                .assetTag(t.getAssetTag())
                .errorMessage(t.getErrorMessage())
                .issueStartDate(t.getIssueStartDate())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();

        if (t.getReporter() != null) {
            dto.setReporterId(t.getReporter().getId());
            dto.setReporterName(t.getReporter().getUsername());
            dto.setReporterEmail(t.getReporter().getEmail());
        }

        if (t.getAssignee() != null) {
            dto.setAssigneeId(t.getAssignee().getId());
            dto.setAssigneeName(t.getAssignee().getUsername());
            dto.setAssigneeEmail(t.getAssignee().getEmail());
        }

        return dto;
    }
}