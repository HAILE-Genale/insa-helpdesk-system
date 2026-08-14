import { apiClient } from './client';

/**
 * Fetch real report data from the backend.
 * Returns KPIs, status/priority/category breakdowns, agent performance,
 * SLA compliance, feedback summary, and recent tickets — all computed from
 * live database data. No demo/hardcoded values.
 */
export async function getReports() {
  return apiClient('/reports');
}
