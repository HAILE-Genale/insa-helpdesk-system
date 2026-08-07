import { apiClient } from './client';

export async function getArticles() {
  return apiClient('/knowledge-base');
}

export async function getMyArticles() {
  return apiClient('/knowledge-base/my');
}

export async function getArticle(id) {
  return apiClient(`/knowledge-base/${id}`);
}

export async function createArticle(data) {
  return apiClient('/knowledge-base', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateArticle(id, data) {
  return apiClient(`/knowledge-base/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteArticle(id) {
  return apiClient(`/knowledge-base/${id}`, { method: 'DELETE' });
}
