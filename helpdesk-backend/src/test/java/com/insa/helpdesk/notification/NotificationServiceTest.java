package com.insa.helpdesk.notification;

import com.insa.helpdesk.common.email.EmailService;
import com.insa.helpdesk.notification.dto.NotificationResponseDto;
import com.insa.helpdesk.notification.entity.Notification;
import com.insa.helpdesk.notification.repository.NotificationRepository;
import com.insa.helpdesk.ticket.entity.Ticket;
import com.insa.helpdesk.ticket.entity.TicketComment;
import com.insa.helpdesk.ticket.repository.TicketRepository;
import com.insa.helpdesk.user.entity.Role;
import com.insa.helpdesk.user.entity.User;
import com.insa.helpdesk.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link NotificationService}.
 *
 * <p>Verifies that end-user-triggered actions (ticket creation, comment/reply)
 * produce the correct notifications for BOTH the end-user (reporter) and the
 * assigned agent — ensuring OS-level browser notifications fire for both parties.</p>
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private NotificationRealtimeService realtimeService;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Role role(String name) {
        return Role.builder().id(1L).name(name).build();
    }

    private User user(Long id, String username, String roleName) {
        return User.builder().id(id).username(username).email(username + "@insa.gov.et")
                .role(role(roleName)).active(true).build();
    }

    private Ticket ticket(Long id, String title, User reporter, User assignee) {
        Ticket ticket = Ticket.builder()
                .id(id)
                .ticketNumber("TK-" + String.format("%05d", id))
                .title(title)
                .description("desc")
                .status("OPEN")
                .priority("MEDIUM")
                .reporter(reporter)
                .assignee(assignee)
                .build();
        return ticket;
    }

    private TicketComment comment(Long id, Ticket ticket, User author, String content, boolean internal) {
        return TicketComment.builder()
                .id(id)
                .ticket(ticket)
                .author(author)
                .content(content)
                .internal(internal)
                .build();
    }

    @Test
    void notifyTicketCreatedForReporter_sendsConfirmationToReporter() {
        User reporter = user(2L, "portaluser", "END_USER");
        User assignee = user(3L, "agent1", "HELPDESK_AGENT");
        Ticket ticket = ticket(10L, "Login Issue", reporter, assignee);

        Notification saved = Notification.builder()
                .id(100L)
                .recipient(reporter)
                .ticket(ticket)
                .title("Ticket Created Successfully")
                .type("TICKET_CREATED")
                .message("test")
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        notificationService.notifyTicketCreatedForReporter(ticket);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification persisted = captor.getValue();
        assertEquals(reporter.getId(), persisted.getRecipient().getId());
        assertEquals(ticket.getId(), persisted.getTicket().getId());
        assertEquals("TICKET_CREATED", persisted.getType());

        // The SSE push happens immediately (no active Spring transaction in unit test).
        verify(realtimeService).sendToUser(eq(reporter.getId()), any(NotificationResponseDto.class));
    }

    @Test
    void notifyTicketCreatedForReporter_nullReporter_doesNothing() {
        User assignee = user(3L, "agent1", "HELPDESK_AGENT");
        Ticket ticket = ticket(10L, "Login Issue", null, assignee);

        notificationService.notifyTicketCreatedForReporter(ticket);

        verify(notificationRepository, never()).save(any());
        verify(realtimeService, never()).sendToUser(anyLong(), any());
    }

    @Test
    void notifyNewComment_userReplies_notifiesAgentAndReporter() {
        User reporter = user(2L, "portaluser", "END_USER");
        User agent = user(3L, "agent1", "HELPDESK_AGENT");
        Ticket ticket = ticket(10L, "Login Issue", reporter, agent);
        TicketComment replyFromUser = comment(50L, ticket, reporter, "Need urgent help!", false);

        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> {
                    Notification notif = inv.getArgument(0);
                    notif.setId(System.nanoTime());
                    return notif;
                });

        notificationService.notifyNewComment(replyFromUser);

        // Agent gets "New Reply from User" notification
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(captor.capture());
        List<Notification> persisted = captor.getAllValues();

        boolean agentNotified = persisted.stream()
                .anyMatch(n -> n.getRecipient().getId().equals(agent.getId())
                        && "NEW_COMMENT".equals(n.getType()));
        boolean reporterNotified = persisted.stream()
                .anyMatch(n -> n.getRecipient().getId().equals(reporter.getId())
                        && "REPLY_SENT".equals(n.getType()));

        assertTrue(agentNotified, "Agent should be notified about user's reply");
        assertTrue(reporterNotified, "Reporter should get a REPLY_SENT confirmation");

        // SSE pushed to both agent and reporter
        verify(realtimeService).sendToUser(eq(agent.getId()), any(NotificationResponseDto.class));
        verify(realtimeService).sendToUser(eq(reporter.getId()), any(NotificationResponseDto.class));
    }

    @Test
    void notifyNewComment_agentReplies_notifiesOnlyReporter() {
        User reporter = user(2L, "portaluser", "END_USER");
        User agent = user(3L, "agent1", "HELPDESK_AGENT");
        Ticket ticket = ticket(10L, "Login Issue", reporter, agent);
        TicketComment replyFromAgent = comment(51L, ticket, agent, "We are looking into this.", false);

        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> {
                    Notification notif = inv.getArgument(0);
                    notif.setId(System.nanoTime());
                    return notif;
                });

        notificationService.notifyNewComment(replyFromAgent);

        // Only the reporter should be notified (NOT the agent who wrote the reply)
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        Notification persisted = captor.getValue();

        assertEquals(reporter.getId(), persisted.getRecipient().getId());
        assertEquals("NEW_COMMENT", persisted.getType());
        assertEquals("New Reply on Your Ticket", persisted.getTitle());

        verify(realtimeService).sendToUser(eq(reporter.getId()), any(NotificationResponseDto.class));
        // Agent should NOT get a notification about their own reply
        verify(realtimeService, never()).sendToUser(eq(agent.getId()), any());
    }

    @Test
    void notifyNewComment_internalNote_notifiesAssigneeAgentNotReporter() {
        User reporter = user(2L, "portaluser", "END_USER");
        User assignee = user(3L, "agent1", "HELPDESK_AGENT");
        User noteAuthor = user(5L, "agent2", "HELPDESK_AGENT");
        Ticket ticket = ticket(10L, "Login Issue", reporter, assignee);
        TicketComment internalNote = comment(52L, ticket, noteAuthor, "Internal: escalate to senior", true);

        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> {
                    Notification notif = inv.getArgument(0);
                    notif.setId(System.nanoTime());
                    return notif;
                });

        notificationService.notifyNewComment(internalNote);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        Notification persisted = captor.getValue();

        assertEquals(assignee.getId(), persisted.getRecipient().getId());
        assertEquals("NEW_INTERNAL_NOTE", persisted.getType());

        // Reporter (end-user) should NOT be notified about internal notes
        verify(realtimeService).sendToUser(eq(assignee.getId()), any(NotificationResponseDto.class));
        verify(realtimeService, never()).sendToUser(eq(reporter.getId()), any());
    }

    @Test
    void notifyNewComment_nullTicket_doesNothing() {
        notificationService.notifyNewComment(null);
        verify(notificationRepository, never()).save(any());
        verify(realtimeService, never()).sendToUser(anyLong(), any());
    }
}
