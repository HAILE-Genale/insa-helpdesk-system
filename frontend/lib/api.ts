import {
  CreateTicketPayload,
  Ticket,
  UpdateStatusPayload,
} from "@/types/ticket";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// FR-007 / FR-008 / FR-009 / FR-010: submit a new ticket via the web portal
export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Ticket>(res);
}

export async function getAllTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE_URL}/tickets`, { cache: "no-store" });
  return handleResponse<Ticket[]>(res);
}

export async function getTicketById(id: number | string): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, { cache: "no-store" });
  return handleResponse<Ticket>(res);
}

// FR-011: agent updates ticket status
export async function updateTicketStatus(
  id: number | string,
  payload: UpdateStatusPayload
): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Ticket>(res);
}
