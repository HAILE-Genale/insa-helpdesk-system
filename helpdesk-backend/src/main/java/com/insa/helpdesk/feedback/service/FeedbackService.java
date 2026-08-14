package com.insa.helpdesk.feedback.service;

import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.feedback.dto.FeedbackRequestDto;
import com.insa.helpdesk.feedback.dto.FeedbackResponseDto;
import com.insa.helpdesk.feedback.entity.Feedback;
import com.insa.helpdesk.feedback.repository.FeedbackRepository;
import com.insa.helpdesk.notification.NotificationService;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Ticket feedback management (FRD 3.5).
 *
 * <p>End-users can submit star ratings (1-5) and optional comments on resolved/closed
 * tickets. When feedback is submitted, a notification is sent to both the assigned agent
 * and the manager of the agent's team.</p>
 */
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Submit feedback for a ticket.
     * The feedback author, the ticket's assigned agent, and the agent's team
     * manager are all resolved from the ticket itself.
     */
    @Transactional
    public FeedbackResponseDto createFeedback(Long ticketId, FeedbackRequestDto request, User author) {
        if (request == null || request.getRating() == null) {
            throw new IllegalArgumentException("Rating is required");
        }
        int rating = Math.max(1, Math.min(5, request.getRating()));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        User persistedAuthor = userRepository.findById(author.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + author.getId()));

        User agent = ticket.getAssignee();
        if (agent == null) {
            throw new IllegalStateException("Cannot submit feedback: ticket has no assigned agent");
        }

        // Prevent duplicate feedback from the same user on the same ticket
        if (feedbackRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .anyMatch(f -> f.getUser().getId().equals(author.getId()))) {
            throw new IllegalStateException("You have already submitted feedback for this ticket");
        }

        Feedback feedback = Feedback.builder()
                .ticket(ticket)
                .user(persistedAuthor)
                .agent(agent)
                .rating(rating)
                .comment(request.getComment())
                .build();

        Feedback saved = feedbackRepository.save(feedback);

        // Notify the agent and the agent's team manager
        try {
             notificationService.notifyFeedbackReceived(ticket, agent, persistedAuthor, rating, request.getComment());
        } catch (Exception e) {
            logger.warn("Could not send feedback notification for ticket {}: {}", ticketId, e.getMessage());
        }

        return toDto(saved);
    }

    /**
     * Get all feedback for a specific ticket.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getFeedbackForTicket(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found: " + ticketId);
        }
        return feedbackRepository.findByTicketIdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Get all feedback the current agent has received.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getFeedbackReceivedByAgent(Long agentId) {
        return feedbackRepository.findByAgentIdOrderByCreatedAtDesc(agentId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Get all feedback (admin/manager view).
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private FeedbackResponseDto toDto(Feedback f) {
        FeedbackResponseDto dto = FeedbackResponseDto.builder()
                .id(f.getId())
                .rating(f.getRating())
                .comment(f.getComment())
                .createdAt(f.getCreatedAt())
                .build();

        if (f.getTicket() != null) {
            dto.setTicketId(f.getTicket().getId());
            dto.setTicketNumber(f.getTicket().getTicketNumber());
        }
        if (f.getUser() != null) {
            dto.setUserId(f.getUser().getId());
            dto.setUserName(f.getUser().getUsername());
        }
        if (f.getAgent() != null) {
            dto.setAgentId(f.getAgent().getId());
            dto.setAgentName(f.getAgent().getUsername());
        }

        return dto;
    }
}
