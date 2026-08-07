package com.insa.helpdesk.assignment;

import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.notification.NotificationService;
import com.insa.helpdesk.team.entity.SupportTeam;
import com.insa.helpdesk.team.entity.TeamMember;
import com.insa.helpdesk.team.entity.TeamRoutingRule;
import com.insa.helpdesk.team.repository.SupportTeamRepository;
import com.insa.helpdesk.team.repository.TeamMemberRepository;
import com.insa.helpdesk.team.repository.TeamRoutingRuleRepository;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketHistory;
import com.insa.helpdesk.ticket.repository.TicketHistoryRepository;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Assignment and Routing (FRD 3.5).
 *
 * <p>Routes a newly created ticket to a team (and the least-loaded agent on that
 * team) based on the ticket's category, and supports manual assignment and
 * reassignment. Every assignment change is recorded in {@link TicketHistory}.</p>
 */
@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final UserRepository userRepository;
    private final SupportTeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRoutingRuleRepository routingRuleRepository;
    private final NotificationService notificationService;

    /** Names of statuses that still count as "open" when measuring agent load. */
    private static final List<String> OPEN_STATUSES = List.of("OPEN", "IN_PROGRESS");

    /**
     * Route a newly created ticket to the appropriate team and agent based on its
     * category. Unmatched categories fall back to the default (Tier-1) team. If no
     * rule and no default team exist, the ticket is left unassigned (creation still
     * succeeds).
     */
    @Transactional
    public Ticket autoRouteOnCreate(Ticket ticket, User changedBy) {
        String category = ticket.getCategory();

        SupportTeam team = null;
        if (category != null && !category.isBlank()) {
            // 1. Prefer a specialist team whose routing rule matches the category string.
            List<TeamRoutingRule> rules = routingRuleRepository.findByCategory(category);
            if (!rules.isEmpty()) {
                team = rules.get(0).getTeam();
            }

            // 2. If no routing rule matched, try finding a team whose name exactly
            //    matches the category — this is the case when the portal form sends
            //    the team name directly as the category (user picked a team by name).
            if (team == null) {
                team = teamRepository.findByName(category).orElse(null);
            }
        }

        if (team == null) {
            List<SupportTeam> defaults = teamRepository.findByIsDefaultTrue();
            team = defaults.isEmpty() ? null : defaults.get(0);
        }

        if (team != null) {
            User assignee = pickMemberForTeam(team, category);
            if (assignee != null) {
                applyAssignment(ticket, assignee, changedBy);
            }
        }

        return ticket;
    }

    /**
     * Manually assign (or reassign) a ticket to a specific agent. Records the change
     * in ticket history.
     */
    @Transactional
    public Ticket assignToAgent(Long ticketId, Long assigneeId, User changedBy) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeId));

        if (!assignee.isActive()) {
            throw new IllegalArgumentException("Cannot assign to inactive user: " + assignee.getUsername());
        }

        applyAssignment(ticket, assignee, changedBy);
        return ticket;
    }

    /** Tickets currently assigned to a given agent. */
    @Transactional(readOnly = true)
    public List<Ticket> getAgentQueue(Long agentId) {
        return ticketRepository.findByAssigneeId(agentId);
    }

    /**
     * Apply an assignment to a ticket and record the change in history.
     * Shared by both auto-routing and manual assignment.
     */
    private void applyAssignment(Ticket ticket, User assignee, User changedBy) {
        String oldAssigneeName = ticket.getAssignee() != null ? ticket.getAssignee().getUsername() : null;
        String newAssigneeName = assignee.getUsername();

        ticket.setAssignee(assignee);
        ticketRepository.save(ticket);

        ticketHistoryRepository.save(
                TicketHistory.builder()
                        .ticket(ticket)
                        .changedBy(changedBy)
                        .fieldName("assignee")
                        .oldValue(oldAssigneeName)
                        .newValue(newAssigneeName)
                        .build());

        // FR-027: notify the newly-assigned agent (both auto-route and manual assign).
        notificationService.notifyAssignment(ticket, assignee, changedBy);
    }

    /**
     * Choose the best active member of a team to handle a ticket with the given
     * category (FR-025 "category and expertise").
     *
     * <p>Preference order:
     * <ol><li>agents whose {@code expertise} matches the ticket's category (least-loaded among them);</li>
     * <li>otherwise the least-loaded active member of the team (fallback), preserving the
     * old behaviour when no expertise is configured.</li></ol></p>
     */
    private User pickMemberForTeam(SupportTeam team, String category) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        if (members.isEmpty()) {
            return null;
        }

        // 1. Experts for this category, if any.
        if (category != null && !category.isBlank()) {
            Optional<User> expert = members.stream()
                    .map(TeamMember::getUser)
                    .filter(User::isActive)
                    .filter(u -> u.getExpertise() != null && u.getExpertise().contains(category))
                    .min(Comparator.comparingLong(this::openTicketCount)
                            .thenComparing(User::getId));
            if (expert.isPresent()) {
                return expert.get();
            }
        }

        // 2. Fallback: least-loaded active member overall.
        return members.stream()
                .map(TeamMember::getUser)
                .filter(User::isActive)
                .min(Comparator.comparingLong(this::openTicketCount)
                        .thenComparing(User::getId))
                .orElse(null);
    }

    /** Count a user's open tickets (OPEN or IN_PROGRESS status). */
    private long openTicketCount(User user) {
        return ticketRepository.findByAssigneeId(user.getId()).stream()
                .filter(t -> OPEN_STATUSES.contains(t.getStatus()))
                .count();
    }
}