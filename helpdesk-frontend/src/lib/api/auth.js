import { apiClient } from './client';

/**
 * POST /users/login — authenticate with username + password.
 * Returns { token, user } from the backend.
 */
export async function login(username, password) {
  return apiClient('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/**
 * POST /users — register a new user.
 * @param {Object} userData  { username, email, password, role, phone, location }
 * @returns the created UserResponseDto
 */
export async function register(userData) {
  return apiClient('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * POST /users/forgot-password?email=...
 * DEV-ONLY: backend currently returns the raw reset token directly.
 */
export async function forgotPassword(email) {
  // The backend returns a plain string, not JSON,
  // so we use a raw fetch here to get the text response.
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085/api';

  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('insa_helpdesk_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${BASE_URL}/users/forgot-password`,
    { method: 'POST', headers, body: JSON.stringify({ email }) }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.text();
}

/**
 * POST /users/reset-password?token=...&newPassword=...
 */
export async function resetPassword(token, newPassword) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085/api';

  const headers = { 'Content-Type': 'application/json' };

  const response = await fetch(
    `${BASE_URL}/users/reset-password`,
    { method: 'POST', headers, body: JSON.stringify({ token, newPassword }) }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  // 204 No Content — nothing to parse
  return;
}
