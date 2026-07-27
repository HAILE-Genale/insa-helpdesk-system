/**
 * INSA Helpdesk — Demo Auth Accounts
 * In production this would be replaced by real API calls.
 */

export const DEMO_ACCOUNTS = [
  {
    id:         'USR-001',
    name:       'Haile Genale',
    email:      'haile@insa.gov.et',
    password:   'admin123',
    role:       'admin',
    department: 'IT Infrastructure',
    avatar:     'HG',
    homeRoute:  '/admin/users',
  },
  {
    id:         'USR-002',
    name:       'Abebe Bikila',
    email:      'abebe@insa.gov.et',
    password:   'agent123',
    role:       'agent',
    department: 'Network Operations (NOC)',
    avatar:     'AB',
    homeRoute:  '/agent/tickets',
  },
  {
    id:         'USR-003',
    name:       'Tigist Alemu',
    email:      'tigist@insa.gov.et',
    password:   'agent123',
    role:       'agent',
    department: 'Tier-1 Helpdesk',
    avatar:     'TA',
    homeRoute:  '/agent/tickets',
  },
  {
    id:         'USR-004',
    name:       'Dawit Tesfaye',
    email:      'dawit@insa.gov.et',
    password:   'manager123',
    role:       'manager',
    department: 'IT Operations',
    avatar:     'DT',
    homeRoute:  '/manager/dashboard',
  },
  {
    id:         'USR-005',
    name:       'Bethlehem Tadesse',
    email:      'bethlehem@insa.gov.et',
    password:   'user123',
    role:       'portal',
    department: 'Finance & Procurement',
    avatar:     'BT',
    homeRoute:  '/portal/my-tickets',
  },
  {
    id:         'USR-006',
    name:       'Solomon Worku',
    email:      'solomon@insa.gov.et',
    password:   'user123',
    role:       'portal',
    department: 'Human Resources',
    avatar:     'SW',
    homeRoute:  '/portal/my-tickets',
  },
];

const STORAGE_KEY = 'insa_helpdesk_user';
const SESSION_COOKIE = 'insa_helpdesk_user';

function persistUser(safeUser) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(safeUser))}; Path=/; SameSite=Lax`;
}

/** Attempt login — returns the user object or null */
export function loginWithCredentials(email, password) {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (!account) return null;

  // Strip the password before storing
  const { password: _pw, ...safeUser } = account;
  persistUser(safeUser);
  return safeUser;
}

/** Login directly by role (one-click demo buttons) */
export function loginAsRole(role) {
  const account = DEMO_ACCOUNTS.find((a) => a.role === role);
  if (!account) return null;
  const { password: _pw, ...safeUser } = account;
  persistUser(safeUser);
  return safeUser;
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
