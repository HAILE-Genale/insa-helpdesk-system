'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROLE_HOME } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

export function RoleGuard({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(user?.role);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
      return;
    }

    if (!hasAllowedRole) {
      router.replace(ROLE_HOME[user.role] || '/');
    }
  }, [hasAllowedRole, loading, pathname, router, user]);

  if (loading || !user || !hasAllowedRole) return null;

  return children;
}
