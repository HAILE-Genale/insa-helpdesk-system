export const ROLES = {
  END_USER: 'END_USER',
  AGENT: 'AGENT',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

export function hasPermission(userRole, requiredRole) {
  return userRole === requiredRole || userRole === ROLES.ADMIN;
}
