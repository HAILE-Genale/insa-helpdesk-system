'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function ticketHref(notification) {
  return notification?.ticketId ? `/agent/tickets/${notification.ticketId}` : '/agent/notifications';
}

export default function AgentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getNotifications(100)
      .then((res) => {
        if (!cancelled) setNotifications(res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load notifications');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkRead = async (notification) => {
    if (notification.read) return;
    setNotifications((current) => current.map((item) => (
      item.id === notification.id ? { ...item, read: true } : item
    )));
    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, read: false } : item
      )));
    }
  };

  const handleMarkAllRead = async () => {
    const previous = notifications;
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-rose-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification History</h1>
          <p className="mt-1 text-xs text-slate-500">
            Recent ticket assignment alerts for your agent account.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="self-start"
        >
          <Check className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-slate-500">No notifications yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            New ticket assignments will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              glass
              className={notification.read ? '' : 'border-brand-200 bg-brand-50/30'}
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        notification.read ? 'bg-slate-300' : 'bg-brand-600'
                      }`} />
                      <span className="text-sm font-bold text-slate-900">{notification.title}</span>
                      {notification.priority && (
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {notification.priority}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                      {notification.ticketNumber || (notification.ticketId ? `#${notification.ticketId}` : 'Ticket')}
                      {notification.createdAt ? ` - ${formatDate(notification.createdAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      href={ticketHref(notification)}
                      onClick={() => handleMarkRead(notification)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white shadow-md transition hover:bg-brand-700"
                    >
                      View Ticket
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
