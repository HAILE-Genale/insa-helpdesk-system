import { apiClient, BASE_URL } from './client';

const BACKEND_ORIGIN = BASE_URL.replace(/\/api$/, '');

export async function getTickets() {
  return apiClient('/tickets');
}

export async function getTicket(id) {
  return apiClient(`/tickets/${id}`);
}

export async function createTicket(data) {
  return apiClient('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function uploadTicketAttachment(ticketId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('insa_helpdesk_token') : null;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}/tickets/${ticketId}/attachments`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Attachment upload failed (${response.status})`);
  }

  return response.json();
}

export async function getTicketAttachments(ticketId) {
  return apiClient(`/tickets/${ticketId}/attachments`);
}

export function resolveAttachmentUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
  if (fileUrl.startsWith('/api/')) return `${BACKEND_ORIGIN}${fileUrl}`;
  if (fileUrl.startsWith('/')) return `${BASE_URL}${fileUrl}`;
  return `${BASE_URL}/${fileUrl}`;
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

/**
 * Fetch the ticket detail page for the manager.
 * GET /tickets is already role-scoped — managers see only their team's tickets.
 */
export async function getTeamTickets() {
  return apiClient('/tickets');
}
