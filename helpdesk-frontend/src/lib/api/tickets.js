import { apiClient } from './client';

export async function getTickets(params) {
  return apiClient('/tickets');
}

export async function getTicket(id) {
  return apiClient(`/tickets/${id}`);
}

export async function createTicket(data) {
  return apiClient('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTicketStatus(id, status) {
  return apiClient(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
