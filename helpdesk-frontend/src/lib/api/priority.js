import { apiClient } from './client';

/**
 * API helpers for Ticket Priority Management.
 */

// GET /priorities/matrix -> { rows: [{ impact, urgency, resultingPriority }] }
export async function fetchPriorityMatrix() {
  const res = await apiClient('/priorities/matrix');
  return res.data.rows;
}

// GET /priorities/calculate?impact=&urgency= -> PriorityLevel string
export async function calculatePriority(impact, urgency) {
  const res = await apiClient(`/priorities/calculate?impact=${impact}&urgency=${urgency}`);
  return res.data;
}

// PUT /priorities/matrix -> updates the configurable matrix (admin)
export async function updatePriorityMatrix(rows) {
  await apiClient('/priorities/matrix', {
    method: 'PUT',
    body: JSON.stringify({ rows }),
  });
}

export const Impact = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };
export const Urgency = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };
export const PriorityLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};
