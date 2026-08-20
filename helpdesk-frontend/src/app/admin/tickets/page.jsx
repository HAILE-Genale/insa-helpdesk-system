'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getTickets } from '@/lib/api/tickets';

const PRIORITY_VARIANT = { CRITICAL: 'urgent', HIGH: 'urgent', MEDIUM: 'progress', LOW: 'default' };

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(() => {
    setLoading(true);
    getTickets()
      .then((res) => setTickets(res?.data ?? res ?? []))
      .catch((err) => setError('Failed to load tickets. ' + (err.message || '')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);
  const stats = {
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            System-wide ticket overview — visible to system administrators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-blue-600">{stats.open}</div>
          <div className="text-xs text-slate-500 mt-0.5">Open</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-amber-600">{stats.inProgress}</div>
          <div className="text-xs text-slate-500 mt-0.5">In Progress</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{stats.resolved}</div>
          <div className="text-xs text-slate-500 mt-0.5">Resolved</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === s ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            {filter === 'ALL' ? 'All Tickets' : `${filter.replace('_', ' ')} Tickets`}
            <span className="ml-2 text-slate-400 font-normal">({filtered.length})</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">Auto-refreshing every 30s</span>
        </div>

        {loading && (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-sm text-rose-600 bg-rose-50">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-sm">
            No tickets found.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="p-3.5 pl-5">Ticket</th>
                  <th className="p-3.5">Requester / Dept</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 pl-5 font-mono font-bold text-brand-600">
                      {item.ticketNumber || `#${item.id}`}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.reporterName || '—'}</div>
                      <div className="text-[10px] text-slate-500">{item.department || '—'}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 max-w-[200px] truncate">
                      {item.title}
                    </td>
                    <td className="p-3.5 text-slate-600">{item.category || '—'}</td>
                    <td className="p-3.5">
                      <Badge variant={PRIORITY_VARIANT[item.priority] || 'default'}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        item.status === 'OPEN'        ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        item.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.status === 'RESOLVED'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="p-3.5 text-right pr-5">
                      <Link href={`/agent/tickets/${item.id}`}>
                        <Badge variant="default" className="cursor-pointer">Open →</Badge>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
