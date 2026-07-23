import { NextResponse } from 'next/server';

export function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/agent/:path*', '/manager/:path*', '/admin/:path*'],
};
