package com.insa.helpdesk.assignment;

import com.insa.helpdesk.common.exception.ResourceNotFoundException;
import com.insa.helpdesk.notification.NotificationService;
import com.insa.helpdesk.team.entity.SupportTeam;
import com.insa.helpdesk.team.entity.TeamMember;
import com.insa.helpdesk.team.repository.SupportTeamRepository;
import com.insa.helpdesk.team.repository.TeamMemberRepository;
import com.insa.helpdesk.team.repository.TeamRoutingRuleRepository;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketHistory;
import com.insa.helpdesk.ticket.repository.TicketHistoryRepository;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AssignmentService} (FRD 3.5).
 *
 * <p>Pure Mockito — no Spring context, so these run independently of the broken
 * mail config and database.</p>
 */
@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TicketHistoryRepository ticketHistoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SupportTeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private TeamRoutingRuleRepository routingRuleRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AssignmentService assignmentService;

    private SupportTeam team(Long id) {
        return SupportTeam.builder().id(id).name("Team-" + id).build();
    }

    private User agent(Long id, String username, boolean active, List<String> expertise) {
        return User.builder().id(id).username(username).email(username + "@insa.gov.et")
                .active(active).expertise(expertise).build();
    }

    private TeamMember member(SupportTeam team, User user) {
        return TeamMember.builder().team(team).user(user).build();
    }

    private Ticket ticket(Long id, String category) {
        return Ticket.builder().id(id).title("Test ticket").category(category).status("OPEN").build();
    }

    @Test
    void manualAssign_recordsHistoryAndNotifies() {
        Ticket ticket = ticket(1L, "Accounts & SSO");
        User assignee = agent(3L, "agent1", true, List.of());
        User changer = agent(2L, "admin", true, List.of());

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(3L)).thenReturn(Optional.of(assignee));

        Ticket result = assignmentService.assignToAgent(1L, 3L, changer);

        assertEquals(assignee, result.getAssignee());
        // History row written with assignee change
        ArgumentCaptor<TicketHistory> historyCaptor = ArgumentCaptor.forClass(TicketHistory.class);
        verify(ticketHistoryRepository).save(historyCaptor.capture());
        assertEquals("assignee", historyCaptor.getValue().getFieldName());
        assertEquals("agent1", historyCaptor.getValue().getNewValue());
        // Notification sent
        verify(notificationService).notifyAssignment(ticket, assignee, changer);
    }

    @Test
    void manualAssign_missingTicket_throws() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> assignmentService.assignToAgent(99L, 3L, agent(2L, "admin", true, List.of())));
        verify(notificationService, never()).notifyAssignment(any(), any(), any());
    }

    @Test
    void autoRoute_prefersExpertForCategory() {
        SupportTeam team = team(1L);
        // agent1 is the expert for "Accounts & SSO"; agent2 is not.
        User expert = agent(3L, "agent1", true, List.of("Accounts & SSO"));
        User other = agent(4L, "agent2", true, List.of("Network & VPN"));
        when(teamMemberRepository.findByTeamId(1L)).thenReturn(List.of(member(team, expert), member(team, other)));
        lenient().when(ticketRepository.findByAssigneeId(any())).thenReturn(List.of());

        Ticket ticket = ticket(10L, "Accounts & SSO");

        // The team is resolved from the routing rule for the category.
        when(routingRuleRepository.findByCategory("Accounts & SSO"))
                .thenReturn(Optional.of(com.insa.helpdesk.team.entity.TeamRoutingRule.builder().team(team).category("Accounts & SSO").build()));

        assignmentService.autoRouteOnCreate(ticket, agent(2L, "admin", true, List.of()));

        assertEquals(expert, ticket.getAssignee(), "The expert for the category should be chosen");
        verify(notificationService).notifyAssignment(eq(ticket), eq(expert), any());
    }

    @Test
    void autoRoute_noExpert_fallsBackToLeastLoaded() {
        SupportTeam team = team(1L);
        // No one has "Hardware (General)" expertise, but agent2 has fewer open tickets.
        User busy = agent(3L, "agent1", true, List.of("Accounts & SSO"));
        User free = agent(4L, "agent2", true, List.of());
        when(teamMemberRepository.findByTeamId(1L)).thenReturn(List.of(member(team, busy), member(team, free)));
        // busy has 2 open tickets, free has 0.
        when(ticketRepository.findByAssigneeId(3L)).thenReturn(List.of(ticket(1L, "a"), ticket(2L, "b")));
        when(ticketRepository.findByAssigneeId(4L)).thenReturn(List.of());
        when(routingRuleRepository.findByCategory("Hardware (General)"))
                .thenReturn(Optional.of(com.insa.helpdesk.team.entity.TeamRoutingRule.builder().team(team).category("Hardware (General)").build()));

        Ticket ticket = ticket(11L, "Hardware (General)");
        assignmentService.autoRouteOnCreate(ticket, agent(2L, "admin", true, List.of()));

        assertEquals(free, ticket.getAssignee(), "No expert -> least-loaded member should be chosen");
    }

    @Test
    void autoRoute_noRule_fallsBackToDefaultTeam() {
        SupportTeam defaultTeam = team(9L);
        User agent = agent(5L, "agent5", true, List.of());
        // No routing rule for "Unknown Category".
        when(routingRuleRepository.findByCategory("Unknown Category")).thenReturn(Optional.empty());
        when(teamRepository.findByIsDefaultTrue()).thenReturn(List.of(defaultTeam));
        when(teamMemberRepository.findByTeamId(9L)).thenReturn(List.of(member(defaultTeam, agent)));
        lenient().when(ticketRepository.findByAssigneeId(any())).thenReturn(List.of());

        Ticket ticket = ticket(12L, "Unknown Category");
        assignmentService.autoRouteOnCreate(ticket, agent(2L, "admin", true, List.of()));

        assertEquals(agent, ticket.getAssignee(), "Unmatched category should fall back to the default team");
    }

    @Test
    void autoRoute_noRuleNoDefault_leavesUnassigned() {
        when(routingRuleRepository.findByCategory("Anything")).thenReturn(Optional.empty());
        when(teamRepository.findByIsDefaultTrue()).thenReturn(List.of());

        Ticket ticket = ticket(13L, "Anything");
        assignmentService.autoRouteOnCreate(ticket, agent(2L, "admin", true, List.of()));

        assertNull(ticket.getAssignee(), "With no rule and no default team, ticket stays unassigned");
        verify(notificationService, never()).notifyAssignment(any(), any(), any());
    }
}
