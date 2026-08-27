'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from '@/lib/NotificationContext';

function relativeTime(value) {
  if (!value) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

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

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markRead: handleMarkReadCtx,
    markAllRead: handleMarkAllReadCtx,
  } = useNotifications();

  const role = user?.role ?? 'portal';

  // Only fetch history + subscribe SSE once (in NotificationProvider), not here.
  // This component only renders the bell UI + dropdown.

  useEffect(() => {
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  const handleMarkRead = (notification) => {
    handleMarkReadCtx(notification);
  };

  const handleMarkAllRead = () => {
    handleMarkAllReadCtx();
  };

  const historyHref = role === 'agent' || role === 'manager' || role === 'admin'
    ? '/agent/notifications'
    : '/portal/notifications';

  return (
    <div className="relative" ref={containerRef}>
      <BellWithPrompt
        open={open}
        unreadCount={unreadCount}
        notifications={notifications}
        onToggle={handleToggle}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        historyHref={historyHref}
        role={role}
      />
    </div>
  );
}

function BellWithPrompt({
  open,
  unreadCount,
  notifications,
  onToggle,
  onMarkRead,
  onMarkAllRead,
  historyHref,
  role,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="text-[10px] font-semibold text-slate-400">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Mark all as read"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-slate-100 px-4 py-3 ${
                    notification.read ? 'bg-white' : 'bg-brand-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2 w-2 rounded-full ${
                      notification.read ? 'bg-slate-200' : 'bg-brand-600'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{notification.message}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {notification.ticketNumber || (notification.ticketId ? `#${notification.ticketId}` : '')}
                          {notification.priority ? ` - ${notification.priority}` : ''}
                          {notification.createdAt ? ` - ${relativeTime(notification.createdAt)}` : ''}
                        </span>
                        <Link
                          href={ticketHref(notification, role)}
                          onClick={() => {
                            onMarkRead(notification);
                            onToggle();
                          }}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-brand-700 hover:bg-brand-100"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href={historyHref}
            onClick={onToggle}
            className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-bold text-brand-700 hover:bg-slate-50"
          >
            View notification history
          </Link>
        </div>
      )}
    </>
  );
}