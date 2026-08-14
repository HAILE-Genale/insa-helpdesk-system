'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const icons = {
  home:         '🏠',
  ticket:       '🎫',
  plus:         '➕',
  book:         '📚',
  queue:        '📋',
  'user-check': '✅',
  clock:        '⏱️',
  bell:         '🔔',
  users:        '👥',
  tag:          '🏷️',
  shield:       '🛡️',
  matrix:       '⚡',
  'git-branch': '🔀',
  list:         '📄',
  teams:        '🤝',
  chart:        '📊',
  dashboard:    '📈',
  escalate:     '🚨',
};

const navigationByRole = {
  portal: [
    { name: 'Overview',       href: '/',                     icon: 'home' },
    { name: 'My Tickets',     href: '/portal/my-tickets',    icon: 'ticket', badge: '3' },
    { name: 'Submit Ticket',  href: '/portal/new-ticket',    icon: 'plus' },
    { name: 'Notifications',  href: '/portal/notifications', icon: 'bell' },
    { name: 'Knowledge Base', href: '/portal/knowledge-base',icon: 'book' },
  ],
  agent: [
    { name: 'Agent Queue',    href: '/agent/tickets',         icon: 'queue',      badge: '12' },
    { name: 'Assigned to Me', href: '/agent/my-queue',        icon: 'user-check' },
    { name: 'Notifications',  href: '/agent/notifications',   icon: 'bell' },
    { name: 'SLA Watchlist',  href: '/agent/sla-watch',       icon: 'clock' },
    { name: 'Knowledge Base', href: '/agent/knowledge-base',  icon: 'book' },
  ],
  admin: [
    { name: 'User Management',  href: '/admin/users',           icon: 'users' },
    { name: 'Categories',       href: '/admin/categories',      icon: 'tag' },
    { name: 'Teams & Routing',  href: '/admin/teams',           icon: 'teams' },
    { name: 'SLA Policies',     href: '/admin/sla-policies',    icon: 'shield' },
    { name: 'Priority Matrix',  href: '/admin/priority-matrix', icon: 'matrix' },
    { name: 'Workflows',        href: '/admin/workflows',        icon: 'git-branch' },
    { name: 'Reports',          href: '/admin/reports',          icon: 'chart' },
    { name: 'Audit Logs',       href: '/admin/audit-logs',       icon: 'list' },
  ],
  manager: [
    { name: 'Dashboard',   href: '/manager/dashboard', icon: 'dashboard' },
    { name: 'All Tickets', href: '/agent/tickets',     icon: 'ticket' },
    { name: 'Escalations', href: '/manager/dashboard', icon: 'escalate', badge: '2' },
    { name: 'Reports',     href: '/admin/reports',     icon: 'chart' },
  ],
};

const roleLabels = {
  portal:  { label: 'Staff Portal',      emoji: '👤', accent: 'from-brand-600 to-indigo-600' },
  agent:   { label: 'Agent Workspace',   emoji: '🎧', accent: 'from-emerald-600 to-teal-600' },
  admin:   { label: 'Admin Console',     emoji: '⚙️', accent: 'from-violet-600 to-purple-700' },
  manager: { label: 'Manager View',      emoji: '📈', accent: 'from-amber-500 to-orange-600' },
};

/** Derive role from the current URL path segment */
function useRoleFromPath() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin'))   return 'admin';
  if (pathname.startsWith('/agent'))   return 'agent';
  if (pathname.startsWith('/manager')) return 'manager';
  return 'portal';
}

export function Sidebar() {
  const pathname = usePathname();
  const role     = useRoleFromPath();
  const { user, logout } = useAuth();

  const currentNav = navigationByRole[role] ?? navigationByRole.portal;
  const meta       = roleLabels[role]       ?? roleLabels.portal;

  return (
    <aside className="w-64 glass-card border-r border-slate-200/80 min-h-[calc(100vh-5rem)] p-4 flex flex-col gap-6 hidden md:flex">
      {/* Role Badge */}
      <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r ${meta.accent} text-white shadow-md`}>
        <span className="text-xl leading-none">{meta.emoji}</span>
        <span className="text-xs font-bold tracking-wide">{meta.label}</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {currentNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base leading-none">{icons[item.icon] || '📌'}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {user.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Back to Home for non-portal sections */}
        {role !== 'portal' && (
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 transition"
          >
            <span>🏠</span>
            <span>Staff Portal</span>
          </Link>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-rose-200 transition"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
