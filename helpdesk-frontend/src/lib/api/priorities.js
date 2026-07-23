import { apiClient } from './client';

export async function getPriorities() {
  return apiClient('/priorities');
}
