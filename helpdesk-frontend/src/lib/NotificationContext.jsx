'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '@/lib/api/notifications';
import { useAuth } from '@/lib/AuthContext';

const NotificationContext = createContext(null);

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

const useNotificationPermission = () => {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    setPermission(Notification.permission);

    const handler = () => setPermission(Notification.permission);
    document.addEventListener('notificationpermissionchange', handler);
    return () => document.removeEventListener('notificationpermissionchange', handler);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      return perm;
    }
    return Notification.permission;
  }, []);

  return { permission, requestPermission };
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const { permission: browserPermission, requestPermission } = useNotificationPermission();

  const role = user?.role ?? 'portal';

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setToast(null);
      return undefined;
    }

    let cancelled = false;

    // Load initial notifications
    Promise.all([getNotifications(10), getUnreadNotificationCount()])
      .then(([listRes, countRes]) => {
        if (cancelled) return;
        setNotifications(listRes?.data ?? []);
        setUnreadCount(countRes?.data?.count ?? 0);
      })
      .catch(() => {});

    // Subscribe to SSE — this stays alive across page navigations
    const unsubscribe = subscribeToNotifications((notification) => {
      if (cancelled) return;

      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 10));
      setUnreadCount((count) => count + (notification.read ? 0 : 1));

      // Show toast
      setToast(notification);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 7000);

      // Browser notification (if permission granted)
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
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [user, router, role]);

  const markRead = async (notification) => {
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

  const markAllRead = async () => {
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

  const dismissToast = () => setToast(null);

  const showPermissionPrompt = browserPermission === 'default' && typeof window !== 'undefined' && 'Notification' in window;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toast,
      markRead,
      markAllRead,
      dismissToast,
      notificationPermission: browserPermission,
      requestNotificationPermission: requestPermission,
      showNotificationPrompt: showPermissionPrompt,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}