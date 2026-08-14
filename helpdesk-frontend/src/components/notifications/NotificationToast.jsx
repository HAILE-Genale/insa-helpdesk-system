'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useNotifications } from '@/lib/NotificationContext';
import { useAuth } from '@/lib/AuthContext';

function ticketHref(notification, role) {
  if (!notification?.ticketId) {
    return role === 'agent' || role === 'manager' || role === 'admin'
      ? '/agent/notifications'
      : '/portal/my-tickets';
  }
  return role === 'agent' || role === 'manager' || role === 'admin'
    ? `/agent/tickets/${notification.ticketId}`
    : `/portal/tickets/${notification.ticketId}`;
}

function isSlaType(type) {
  return type === 'SLA_BREACHED' || type === 'SLA_BREACH_IMMINENT';
}

export function NotificationToast() {
  const { user } = useAuth();
  const { toast, markRead, dismissToast } = useNotifications();
  const role = user?.role ?? 'portal';

  if (!toast) return null;

  const sla = isSlaType(toast.type);
  const breached = toast.type === 'SLA_BREACHED';

  return (
    <div className="fixed right-4 top-24 z-[100] w-80 animate-fade-in">
      <Link
        href={ticketHref(toast, role)}
        onClick={() => {
          markRead(toast);
          dismissToast();
        }}
        className={`block w-full rounded-lg border p-4 shadow-xl hover:shadow-lg transition group ${
          breached
            ? 'border-rose-300 bg-rose-50 hover:border-rose-500'
            : sla
              ? 'border-amber-300 bg-amber-50 hover:border-amber-500'
              : 'border-brand-200 bg-white hover:border-brand-400'
        }`}
        title="View ticket"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-sm font-bold ${breached ? 'text-rose-700' : sla ? 'text-amber-700' : 'text-slate-900 group-hover:text-brand-700'}`}>
              {toast.title}
            </p>
            <p className={`mt-1 line-clamp-2 text-xs ${breached ? 'text-rose-600' : sla ? 'text-amber-600' : 'text-slate-600'}`}>
              {toast.message}
            </p>
            {toast.ticketNumber && (
              <p className={`mt-1.5 text-[10px] font-bold ${breached ? 'text-rose-700' : sla ? 'text-amber-700' : 'text-brand-600'}`}>
                {toast.ticketNumber} · View ticket →
              </p>
            )}
          </div>
          {breached ? (
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 animate-pulse" />
          ) : sla ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          ) : (
            <ExternalLink className="h-4 w-4 shrink-0 text-brand-600 group-hover:text-brand-700" />
          )}
        </div>
      </Link>
    </div>
  );
}