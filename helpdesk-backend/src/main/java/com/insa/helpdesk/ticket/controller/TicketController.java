package com.insa.helpdesk.ticket.controller;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.security.UserPrincipal;
import com.insa.helpdesk.ticket.dto.*;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketComment;
import com.insa.helpdesk.ticket.service.TicketService;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

/**
 * REST endpoints for tickets (FRD 3.5 "Assignment and Routing").
 */
@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketController {

    private final TicketService ticketService;

    /** List all tickets (admin/agent view). */
    @GetMapping
    public ApiResponse<List<TicketResponseDto>> listTickets() {
        List<TicketResponseDto> data = ticketService.getAllTickets().stream()
                .map(this::toResponseDto)
                .toList();
        return ApiResponse.success(data, "Tickets");
    }

    /** Get a single ticket by id. */
    @GetMapping("/{id}")
    public ApiResponse<TicketResponseDto> getTicket(@PathVariable Long id) {
        return ApiResponse.success(toResponseDto(ticketService.getTicket(id)), "Ticket");
    }

    /**
     * Create a new ticket. The ticket is auto-routed to a team/agent based on category.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('TICKET_CREATE')")
    @Transactional
    public ApiResponse<TicketResponseDto> createTicket(
            @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        User reporter = resolveUser(authentication);
        Ticket created = ticketService.createTicket(request, reporter);
        return ApiResponse.success(toResponseDto(created), "Ticket created");
    }

    /** Update a ticket's status. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('TICKET_MANAGE')")
    @Transactional
    public ApiResponse<TicketResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        User changedBy = resolveUser(authentication);
        Ticket updated = ticketService.updateStatus(id, request.getStatus(), changedBy);
        return ApiResponse.success(toResponseDto(updated), "Status updated");
    }

    /** Add a comment or internal note to a ticket. */
    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('TICKET_COMMENT')")
    @Transactional
    public ApiResponse<CommentResponseDto> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request,
            Authentication authentication) {

        User author = resolveUser(authentication);
        TicketComment comment = ticketService.addComment(id, request, author);
        return ApiResponse.success(toCommentDto(comment), "Comment added");
    }

    /** Get comments for a ticket (internal notes filtered by controller if needed). */
    @GetMapping("/{id}/comments")
    public ApiResponse<List<CommentResponseDto>> getComments(@PathVariable Long id) {
        // TODO: filter internal comments based on user role
        List<CommentResponseDto> comments = ticketService.getComments(id).stream()
                .map(this::toCommentDto)
                .toList();
        return ApiResponse.success(comments, "Comments");
    }

    /** Tickets submitted by the current user (portal "My Tickets"). */
    @GetMapping("/my-tickets")
    public ApiResponse<List<TicketResponseDto>> myTickets(Authentication authentication) {
        User user = resolveUser(authentication);
        List<TicketResponseDto> data = ticketService.getMyTickets(user.getId()).stream()
                .map(this::toResponseDto)
                .toList();
        return ApiResponse.success(data, "My tickets");
    }

    /** The current agent's assigned tickets (their queue). */
    @GetMapping("/my-queue")
    @PreAuthorize("hasAuthority('TICKET_MANAGE')")
    public ApiResponse<List<TicketResponseDto>> myQueue(Authentication authentication) {
        User agent = resolveUser(authentication);
        List<TicketResponseDto> data = ticketService.getAgentQueue(agent.getId()).stream()
                .map(this::toResponseDto)
                .toList();
        return ApiResponse.success(data, "My queue");
    }

    /** Assign (or reassign) a ticket to a specific agent. */
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('TICKET_ASSIGN')")
    @Transactional
    public ApiResponse<TicketResponseDto> assignTicket(
            @PathVariable Long id,
            @RequestBody AssignRequest body,
            Authentication authentication) {

        User changedBy = resolveUser(authentication);
        Ticket updated = ticketService.assignTicket(id, body.getAssigneeId(), changedBy);
        return ApiResponse.success(toResponseDto(updated), "Ticket assigned");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

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

    private CommentResponseDto toCommentDto(TicketComment c) {
        return CommentResponseDto.builder()
                .id(c.getId())
                .ticketId(c.getTicket().getId())
                .authorId(c.getAuthor().getId())
                .authorName(c.getAuthor().getUsername())
                .content(c.getContent())
                .internal(c.isInternal())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private User resolveUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal up) {
            return up.getUser();
        }
        // Fallback for testing (should not happen in production with real auth).
        return User.builder().id(1L).username("system").build();
    }

    /** Simple request body for status update: { "status": "IN_PROGRESS" } */
    public static class StatusUpdateRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    /** Simple request body for assignment: { "assigneeId": 123 } */
    public static class AssignRequest {
        private Long assigneeId;
        public Long getAssigneeId() { return assigneeId; }
        public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    }
}
