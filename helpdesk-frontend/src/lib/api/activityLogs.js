import { apiClient } from './client';

export async function getActivityLogs(page = 0, size = 20) {
  return apiClient(`/users/activity-logs?page=${page}&size=${size}`);
}
