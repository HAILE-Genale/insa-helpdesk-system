import { apiClient } from './client';

export async function getUsers() {
  return apiClient('/users');
}

export async function getUserById(id) {
  return apiClient(`/users/${id}`);
}

export async function updateUser(id, data) {
  return apiClient(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deactivateUser(id) {
  return apiClient(`/users/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export async function activateUser(id) {
  return apiClient(`/users/${id}/activate`, {
    method: 'PATCH',
  });
}
