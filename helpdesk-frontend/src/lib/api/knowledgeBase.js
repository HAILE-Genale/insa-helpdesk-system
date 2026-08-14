import { apiClient, BASE_URL } from './client';

export const BACKEND_ORIGIN = BASE_URL.replace(/\/api$/, '');

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

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('insa_helpdesk_token') : null;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/knowledge-base/upload-image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed (${res.status})`);
  }
  const json = await res.json();
  if (json?.success === false || !json?.data) {
    throw new Error(json?.message || 'Image upload did not return a file URL');
  }
  return json.data;
}

export function resolveImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/api/')) return `${BACKEND_ORIGIN}${image}`;
  if (image.startsWith('/')) return `${BASE_URL}${image}`;
  return `${BASE_URL}/${image}`;
}
