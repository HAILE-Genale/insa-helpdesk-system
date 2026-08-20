import { apiClient } from './client';

export async function fetchWorkflows() {
  return apiClient('/workflows', { method: 'GET' });
}

export async function createWorkflow(workflow) {
  return apiClient('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflow),
  });
}

export async function updateWorkflow(id, workflow) {
  return apiClient(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workflow),
  });
}

export async function deleteWorkflow(id) {
  return apiClient(`/workflows/${id}`, { method: 'DELETE' });
}
