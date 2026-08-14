import { apiClient } from './client';

/**
 * Submit feedback (1-5 rating + optional comment) on a resolved/closed ticket.
 * Requires TICKET_COMMENT authority (end users have this).
 */
export async function submitFeedback(ticketId, rating, comment = '') {
  return apiClient(`/feedback/tickets/${ticketId}`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}

/**
 * Get all feedback submitted for a ticket.
 */
export async function getTicketFeedback(ticketId) {
  return apiClient(`/feedback/tickets/${ticketId}`);
}

/**
 * Get feedback received by the current agent.
 */
export async function getMyReceivedFeedback() {
  return apiClient('/feedback/my-received');
}

/**
 * Get all feedback — admin/manager view.
 */
export async function getAllFeedback() {
  return apiClient('/feedback');
}
