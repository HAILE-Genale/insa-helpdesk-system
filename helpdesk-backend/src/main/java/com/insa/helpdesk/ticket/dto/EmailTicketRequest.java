package com.insa.helpdesk.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for creating a ticket from an inbound email.
 * <p>Typically posted by an email gateway (e.g. a mail-to-ticket bridge) with
 * the sender's address, the email subject, and the email body.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailTicketRequest {
    /** Sender's email address — used to resolve the reporter. */
    private String fromEmail;

    /** Sender's display name (optional). */
    private String fromName;

    /** Email subject — becomes the ticket title. */
    private String subject;

    /** Email body — becomes the ticket description. */
    private String body;

    /** Optional category hint (e.g. "Network", "Hardware"). */
    private String category;

    /** Optional priority hint (LOW, MEDIUM, HIGH, CRITICAL). */
    private String priority;
}