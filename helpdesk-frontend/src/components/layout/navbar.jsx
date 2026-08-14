'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_LABELS } from '@/lib/auth';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const roleMeta = {
  portal:  { label: 'Staff Portal',    color: 'bg-brand-50 text-brand-700 border-brand-200',   emoji: '👤' },
  agent:   { label: 'Agent Workspace', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', emoji: '🎧' },
  admin:   { label: 'Admin Console',   color: 'bg-violet-50 text-violet-700 border-violet-200',   emoji: '⚙️' },
  manager: { label: 'Manager View',    color: 'bg-amber-50 text-amber-700 border-amber-200',       emoji: '📈' },
};

function useRoleFromPath() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin'))   return 'admin';
  if (pathname.startsWith('/agent'))   return 'agent';
  if (pathname.startsWith('/manager')) return 'manager';
  return 'portal';
}

export function Navbar() {
  const pathRole = useRoleFromPath();
  const { user } = useAuth();
  const role = user?.role ?? pathRole;
  const meta = roleMeta[role] ?? roleMeta.portal;

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-200 border-b border-slate-200/80">
      {/* Top National Strip */}
      <div className="bg-gradient-to-r from-emerald-600 via-amber-400 to-brand-600 h-1 w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Emblem Badge */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition duration-200 border border-brand-400/30">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-brand-600 transition">
                    INSA ETHIOPIA
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    IT Helpdesk
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1">
                  የኢንፎርሜርሽን መረብ ደህንነት አስተዳደር - የአይቲ ሄልፕዴስክ
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tickets, knowledge base, users..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-400 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Active Role Badge */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${meta.color}`}>
              <span>{meta.emoji}</span>
              {meta.label}
            </div>

            {/* IT Helpdesk Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </div>

            {user && <NotificationBell />}

            <Link
              href="/portal/new-ticket"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md transition hover:shadow-brand-500/20 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Submit Ticket
            </Link>

            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-bold text-slate-800">
                {user?.name ?? 'Sign in'}
              </span>
              <span className="text-[10px] text-slate-500">
                {user ? ROLE_LABELS[user.role] : 'Demo account'}
              </span>
            </div>

            <Link
              href="/login"
              aria-label={user ? `Switch account from ${user.name}` : 'Sign in'}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.avatar ?? 'INSA'}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
