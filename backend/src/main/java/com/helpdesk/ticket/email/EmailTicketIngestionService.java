package com.helpdesk.ticket.email;

import com.helpdesk.ticket.TicketChannel;
import com.helpdesk.ticket.TicketPriority;
import com.helpdesk.ticket.TicketService;
import com.helpdesk.ticket.dto.CreateTicketRequest;
import org.springframework.stereotype.Service;

/**
 * FR-010 (email half): converts an incoming support email into a ticket.
 *
 * This is a starting point, not a full mail client. To make it live:
 *  1. Add "spring-boot-starter-mail" to pom.xml.
 *  2. Configure an IMAP mailbox in application.properties
 *     (spring.mail.host, spring.mail.username, spring.mail.password, imap port, etc.).
 *  3. Add a scheduled job (@Scheduled) or a JavaMail IMAP IdleManager that calls
 *     handleIncomingEmail(...) for each new unread message, then marks it as read.
 *
 * Wiring the actual mailbox is left as a follow-up once the ticket module itself
 * is reviewed, since it depends on which mail server the organization uses
 * (Exchange, Gmail, etc.) and its credentials.
 */
@Service
public class EmailTicketIngestionService {

    private final TicketService ticketService;

    public EmailTicketIngestionService(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * Call this for each parsed inbound email.
     */
    public void handleIncomingEmail(String fromEmail, String fromName, String subject, String body) {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle(subject);
        request.setDescription(body);
        request.setCategory("Uncategorized"); // triaged/reassigned by an agent later (FR-026)
        request.setPriority(TicketPriority.MEDIUM); // default until an agent reassesses (FR-021)
        request.setChannel(TicketChannel.EMAIL);
        request.setRequesterName(fromName != null ? fromName : fromEmail);
        request.setRequesterEmail(fromEmail);

        ticketService.createTicket(request);
    }
}
