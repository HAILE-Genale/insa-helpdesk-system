/**
 * INSA Helpdesk — Real Auth (backed by Spring Boot API)
 */

import { login as apiLogin } from '@/lib/api/auth';

const STORAGE_KEY = 'insa_helpdesk_user';
const TOKEN_KEY = 'insa_helpdesk_token';
const SESSION_COOKIE = 'insa_helpdesk_user';

/** Backend role → frontend route bucket */
const ROLE_MAP = {
  SYSTEM_ADMIN:       'admin',
  HELPDESK_MANAGER:   'manager',
  HELPDESK_AGENT:     'agent',
  END_USER:           'portal',
};

function persistUser(safeUser) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(safeUser))}; Path=/; SameSite=Lax`;
}

/**
 * Attempt login — returns the user object or null.
 * Calls the real backend POST /users/login.
 */
export async function loginWithCredentials(username, password) {
  try {
    const data = await apiLogin(username, password);
    // data = { token, user: { id, username, email, role, phone, location } }

    // Store the raw JWT
    localStorage.setItem(TOKEN_KEY, data.token);

    // Map the backend role to a frontend bucket
    const backendRole = data.user.role;
    const mappedRole = ROLE_MAP[backendRole] || 'portal';

    const safeUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: mappedRole,
      backendRole: backendRole,
      phone: data.user.phone,
      location: data.user.location,
    };

    persistUser(safeUser);
    return safeUser;
  } catch {
    return null;
  }
}

/** Get the currently logged-in user (client-side only) */
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Log out */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

/** Role → readable label */
export const ROLE_LABELS = {
  admin:   'Admin Console',
  agent:   'Agent Workspace',
  manager: 'Manager View',
  portal:  'Staff Portal',
};

/** Role → home route */
export const ROLE_HOME = {
  admin:   '/admin/users',
  agent:   '/agent/tickets',
  manager: '/manager/dashboard',
  portal:  '/portal/my-tickets',
};
