import { apiClient } from './client';

export async function getTickets() {
  return apiClient('/tickets');
}

export async function getTicket(id) {
  return apiClient(`/tickets/${id}`);
}

export async function createTicket(data) {
  return apiClient('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTicketStatus(id, status) {
  return apiClient(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getMyTickets() {
  return apiClient('/tickets/my-tickets');
}

export async function getMyQueue() {
  return apiClient('/tickets/my-queue');
}

export async function assignTicket(id, assigneeId) {
  return apiClient(`/tickets/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assigneeId }),
  });
}

export async function manualAssignTicket(id, assigneeId) {
  return apiClient(`/tickets/${id}/manual-assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigneeId }),
  });
}

export async function getComments(ticketId) {
  return apiClient(`/tickets/${ticketId}/comments`);
}

export async function addComment(ticketId, content, internal = false) {
  return apiClient(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, internal }),
  });
}
