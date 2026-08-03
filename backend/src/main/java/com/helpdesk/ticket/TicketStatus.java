package com.helpdesk.ticket;

/**
 * Ticket lifecycle states (FR-011: agents can update ticket status).
 * Matches the example workflow in the FRD:
 * New -> Assigned -> In Progress -> Pending User Response -> Resolved -> Closed
 */
public enum TicketStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    PENDING_USER_RESPONSE,
    RESOLVED,
    CLOSED,
    REOPENED
}
