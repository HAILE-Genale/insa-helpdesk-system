package com.helpdesk.ticket.dto;

import com.helpdesk.ticket.ServiceTeam;
import com.helpdesk.ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Payload used by an agent to change a ticket's status (FR-011), and
 * optionally reassign its team (FR-026: manual reassignment).
 */
@Getter
@Setter
public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    // Optional: who made the change / resolution note, agent name etc.
    private String agentName;

    private String note;

    // FR-026: optional manual reassignment to a different team
    private ServiceTeam team;
}
