import { apiClient } from './client';

export async function getSlaPolicies() {
  return apiClient('/sla-policies');
}
