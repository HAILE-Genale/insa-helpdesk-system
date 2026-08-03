package com.helpdesk.ticket.dto;

import com.helpdesk.ticket.ServiceTeam;
import com.helpdesk.ticket.Ticket;
import com.helpdesk.ticket.TicketChannel;
import com.helpdesk.ticket.TicketPriority;
import com.helpdesk.ticket.TicketStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketResponse {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private String category;
    private String subCategory;
    private TicketPriority priority;
    private TicketStatus status;
    private TicketChannel channel;
    private String requesterName;
    private String requesterEmail;
    private String requesterDepartment;
    private String attachmentUrl;
    private ServiceTeam assignedTeam;
    private String assignedAgent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketResponse fromEntity(Ticket t) {
        TicketResponse r = new TicketResponse();
        r.setId(t.getId());
        r.setTicketNumber(t.getTicketNumber());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setCategory(t.getCategory());
        r.setSubCategory(t.getSubCategory());
        r.setPriority(t.getPriority());
        r.setStatus(t.getStatus());
        r.setChannel(t.getChannel());
        r.setRequesterName(t.getRequesterName());
        r.setRequesterEmail(t.getRequesterEmail());
        r.setRequesterDepartment(t.getRequesterDepartment());
        r.setAttachmentUrl(t.getAttachmentUrl());
        r.setAssignedTeam(t.getAssignedTeam());
        r.setAssignedAgent(t.getAssignedAgent());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
