import { apiClient } from './client';

export async function getUsers() {
  return apiClient('/users');
}
