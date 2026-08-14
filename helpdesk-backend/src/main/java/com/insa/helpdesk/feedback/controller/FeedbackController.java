package com.insa.helpdesk.feedback.controller;

import com.insa.helpdesk.common.dto.ApiResponse;
import com.insa.helpdesk.common.security.UserPrincipal;
import com.insa.helpdesk.feedback.dto.FeedbackRequestDto;
import com.insa.helpdesk.feedback.dto.FeedbackResponseDto;
import com.insa.helpdesk.feedback.service.FeedbackService;
import com.insa.helpdesk.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for ticket feedback (FRD 3.5 "Feedback").
 */
@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * Submit feedback for a ticket — end users can rate 1-5 stars.
     * Requires TICKET_COMMENT authority (end users have this).
     */
    @PostMapping("/tickets/{ticketId}")
    @PreAuthorize("hasAuthority('TICKET_COMMENT')")
    @Transactional
    public ApiResponse<FeedbackResponseDto> createFeedback(
            @PathVariable Long ticketId,
            @RequestBody FeedbackRequestDto request,
            Authentication authentication) {

        User author = resolveUser(authentication);
        FeedbackResponseDto dto = feedbackService.createFeedback(ticketId, request, author);
        return ApiResponse.success(dto, "Feedback submitted");
    }

    /**
     * Get all feedback for a ticket — visible to anyone who can see the ticket.
     */
    @GetMapping("/tickets/{ticketId}")
    public ApiResponse<List<FeedbackResponseDto>> getFeedbackForTicket(@PathVariable Long ticketId) {
        return ApiResponse.success(feedbackService.getFeedbackForTicket(ticketId), "Feedback");
    }

    /**
     * Get feedback received by the current agent — agent view.
     */
    @GetMapping("/my-received")
    @PreAuthorize("hasAuthority('TICKET_VIEW')")
    public ApiResponse<List<FeedbackResponseDto>> getMyReceivedFeedback(Authentication authentication) {
        User agent = resolveUser(authentication);
        return ApiResponse.success(feedbackService.getFeedbackReceivedByAgent(agent.getId()), "Your feedback");
    }

    /**
     * Get all feedback — admin/manager view.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('REPORTING_VIEW')")
    public ApiResponse<List<FeedbackResponseDto>> getAllFeedback() {
        return ApiResponse.success(feedbackService.getAllFeedback(), "All feedback");
    }

    private User resolveUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal up) {
            return up.getUser();
        }
        return User.builder().id(1L).username("system").build();
    }
}
