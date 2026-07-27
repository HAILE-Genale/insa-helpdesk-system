import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'insa_helpdesk_user';
const ROLE_HOME = {
  admin: '/admin/users',
  agent: '/agent/tickets',
  manager: '/manager/dashboard',
  portal: '/portal/my-tickets',
};
const ROLE_PREFIXES = {
  admin: '/admin',
  agent: '/agent',
  manager: '/manager',
  portal: '/portal',
};

function getStoredUser(request) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function middleware(request) {
  const user = getStoredUser(request);
  const requestedPath = request.nextUrl.pathname;

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', requestedPath);
    return NextResponse.redirect(loginUrl);
  }

  const rolePrefix = ROLE_PREFIXES[user.role];
  if (!rolePrefix || !requestedPath.startsWith(rolePrefix)) {
    return NextResponse.redirect(new URL(ROLE_HOME[user.role] || '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/agent/:path*', '/manager/:path*', '/admin/:path*'],
};
