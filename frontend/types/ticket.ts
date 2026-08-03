export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TicketStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_USER_RESPONSE"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";

export type TicketChannel = "WEB_PORTAL" | "EMAIL";

// Service-provider teams for this technology institute deployment
export type ServiceTeam =
  | "NETWORKING"
  | "ELECTRICIAN"
  | "SOFTWARE"
  | "HARDWARE"
  | "AV_SYSTEMS";

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  requesterName: string;
  requesterEmail: string;
  requesterDepartment?: string;
  attachmentUrl?: string;
  assignedTeam: ServiceTeam;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// FR-007 / FR-009: fields required to create a ticket
export interface CreateTicketPayload {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  priority: TicketPriority;
  requesterName: string;
  requesterEmail: string;
  requesterDepartment?: string;
  attachmentUrl?: string;
  // FR-023: optional team pick; if omitted, backend auto-routes by category
  team?: ServiceTeam;
}

// FR-011: payload to change a ticket's status
export interface UpdateStatusPayload {
  status: TicketStatus;
  agentName?: string;
  note?: string;
  // FR-026: optional manual team reassignment
  team?: ServiceTeam;
}
