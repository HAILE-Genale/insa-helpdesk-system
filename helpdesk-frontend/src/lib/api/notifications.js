import { apiClient, BASE_URL } from './client';

const TOKEN_KEY = 'insa_helpdesk_token';

export async function getNotifications(limit = 20) {
  return apiClient(`/notifications?limit=${encodeURIComponent(limit)}`);
}

export async function getUnreadNotificationCount() {
  return apiClient('/notifications/unread-count');
}

export async function markNotificationRead(id) {
  return apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiClient('/notifications/read-all', { method: 'PATCH' });
}

export function subscribeToNotifications(onNotification, onError) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let stopped = false;
  let reconnectTimer;
  let controller;

  async function connect() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || stopped) return;

    controller = new AbortController();

    try {
      const response = await fetch(`${BASE_URL}/notifications/stream`, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Notification stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!stopped) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        events.forEach((rawEvent) => {
          const lines = rawEvent.split('\n');
          const eventName = lines
            .find((line) => line.startsWith('event:'))
            ?.replace('event:', '')
            .trim();
          const data = lines
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.replace('data:', '').trim())
            .join('');

          if (eventName === 'notification' && data) {
            onNotification(JSON.parse(data));
          }
        });
      }
    } catch (error) {
      if (!stopped) {
        onError?.(error);
      }
    } finally {
      if (!stopped) {
        reconnectTimer = window.setTimeout(connect, 3000);
      }
    }
  }

  connect();

  return () => {
    stopped = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    controller?.abort();
  };
}
