'use client';

import React, { useState, useEffect } from 'react';

/**
 * Live SLA countdown timer.
 * Displays remaining time before the SLA deadline, turns red when breached.
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0) return 'BREACHED';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function getSlaStatus(deadlineIso) {
  if (!deadlineIso) return 'NO_SLA';
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (ms <= 0) return 'BREACHED';
  if (ms <= 30 * 60 * 1000) return 'CRITICAL'; // < 30 min
  if (ms <= 2 * 60 * 60 * 1000) return 'WARNING'; // < 2 hours
  return 'ON_TRACK';
}

export function SlaCountdown({ deadline, violated, size = 'sm' }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline) return null;

  const ms = new Date(deadline).getTime() - now;
  const status = getSlaStatus(deadline);
  const text = formatDuration(ms);

  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'WARNING') bg = 'bg-amber-50 text-amber-700 border-amber-300';
  if (status === 'CRITICAL') bg = 'bg-orange-50 text-orange-700 border-orange-300 animate-pulse';
  if (status === 'BREACHED' || violated) bg = 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse';

  const label = violated ? 'SLA BREACHED' : status === 'BREACHED' ? 'SLA BREACHED' : 'SLA';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold rounded-lg border px-2 py-1 ${bg} ${
        size === 'lg' ? 'text-sm' : 'text-[10px]'
      }`}
      title={`SLA Deadline: ${new Date(deadline).toLocaleString()}`}
    >
      ⏱️ {label}: {text}
    </span>
  );
}