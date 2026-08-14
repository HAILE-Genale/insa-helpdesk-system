'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, ExternalLink } from 'lucide-react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '@/lib/api/notifications';
import { useAuth } from '@/lib/AuthContext';

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const role = user?.role ?? 'portal';

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    setLoading(true);
    Promise.all([getNotifications(10), getUnreadNotificationCount()])
      .then(([listRes, countRes]) => {
        if (cancelled) return;
        setNotifications(listRes?.data ?? []);
        setUnreadCount(countRes?.data?.count ?? 0);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load notifications');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 10));
      setUnreadCount((count) => count + (notification.read ? 0 : 1));
      setToast(notification);
      window.setTimeout(() => setToast((current) => (
        current?.id === notification.id ? null : current
      )), 7000);

      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title || 'Help Desk Notification', {
          body: notification.message,
          tag: `helpdesk-notification-${notification.id}`,
        });
        browserNotification.onclick = () => {
          window.focus();
          router.push(ticketHref(notification, role));
        };
      }
    }, () => {});

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router, user, role]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleToggle = async () => {
    setOpen((current) => !current);
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleMarkRead = async (notification) => {
    if (notification.read) return;
    setNotifications((current) => current.map((item) => (
      item.id === notification.id ? { ...item, read: true } : item
    )));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, read: false } : item
      )));
      setUnreadCount((count) => count + 1);
    }
  };

  const handleMarkAllRead = async () => {
    const previous = notifications;
    const previousCount = unreadCount;
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
      setUnreadCount(previousCount);
    }
  };

  const historyHref = role === 'agent' || role === 'manager' || role === 'admin'
    ? '/agent/notifications'
    : '/portal/notifications';

  return (
    <div className="relative" ref={containerRef}>
      {toast && (
        <Link
          href={ticketHref(toast, role)}
          onClick={() => {
            handleMarkRead(toast);
            setToast(null);
          }}
          className="fixed right-4 top-24 z-50 w-80 rounded-lg border border-brand-200 bg-white p-4 shadow-xl hover:border-brand-400 hover:shadow-lg transition group"
          title="View ticket"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 group-hover:text-brand-700">{toast.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{toast.message}</p>
              {toast.ticketNumber && (
                <p className="mt-1.5 text-[10px] font-bold text-brand-600">
                  {toast.ticketNumber} · View ticket →
                </p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-brand-600 group-hover:text-brand-700" />
          </div>
        </Link>
      )}

      <button
        type="button"
        onClick={handleToggle}
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
              onClick={handleMarkAllRead}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Mark all as read"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-center text-xs text-slate-500">Loading notifications...</div>
            )}
            {!loading && error && (
              <div className="px-4 py-6 text-center text-xs text-rose-600">{error}</div>
            )}
            {!loading && !error && notifications.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-slate-500">No notifications yet.</div>
            )}
            {!loading && !error && notifications.map((notification) => (
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
                          handleMarkRead(notification);
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-brand-700 hover:bg-brand-100"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={historyHref}
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-bold text-brand-700 hover:bg-slate-50"
          >
            View notification history
          </Link>
        </div>
      )}
    </div>
  );
}