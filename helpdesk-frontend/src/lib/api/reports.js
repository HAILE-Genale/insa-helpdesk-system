import { apiClient } from './client';

export async function getReports() {
  return apiClient('/reports');
}
