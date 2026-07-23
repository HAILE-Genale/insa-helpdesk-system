import { apiClient } from './client';

export async function getCategories() {
  return apiClient('/categories');
}
