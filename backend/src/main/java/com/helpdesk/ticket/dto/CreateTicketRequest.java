package com.helpdesk.ticket.dto;

import com.helpdesk.ticket.ServiceTeam;
import com.helpdesk.ticket.TicketChannel;
import com.helpdesk.ticket.TicketPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Payload used when a user submits a new ticket (FR-007, FR-009, FR-010).
 */
@Getter
@Setter
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String subCategory;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    // Defaults to WEB_PORTAL if not supplied; email intake service sets this explicitly
    private TicketChannel channel = TicketChannel.WEB_PORTAL;

    @NotBlank(message = "Requester name is required")
    private String requesterName;

    @NotBlank(message = "Requester email is required")
    @Email(message = "Requester email must be valid")
    private String requesterEmail;

    private String requesterDepartment;

    private String attachmentUrl;

    // FR-023: requester can pick a team; if left null, the service auto-routes
    // by category (FR-025).
    private ServiceTeam team;
}
