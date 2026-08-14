'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getMyTickets } from '@/lib/api/tickets';

const STATUS_VARIANT = {
  OPEN: 'open',
  IN_PROGRESS: 'progress',
  ON_HOLD: 'default',
  RESOLVED: 'resolved',
  CLOSED: 'default',
};

const PRIORITY_VARIANT = {
  CRITICAL: 'urgent',
  HIGH: 'urgent',
  MEDIUM: 'progress',
  LOW: 'default',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function MyTicketsPage() {
  const [filter, setFilter] = useState('ALL');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTickets()
      .then((res) => setTickets(res?.data ?? res ?? []))
      .catch((err) => setError('Failed to load tickets. ' + (err.message || '')))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Support Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, communicate with assigned IT agents, or view resolution logs.
          </p>
        </div>
        <Link href="/portal/new-ticket">
          <Button variant="primary" size="sm">+ New Ticket</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 flex-wrap">
        {FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status.replace('_', ' ')}
            {status !== 'ALL' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({tickets.filter((t) => t.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🎫</div>
          <p className="text-slate-500 font-semibold">No tickets found</p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'ALL' ? "You haven't submitted any tickets yet." : `No ${filter.replace('_', ' ').toLowerCase()} tickets.`}
          </p>
          {filter === 'ALL' && (
            <Link href="/portal/new-ticket">
              <Button variant="primary" size="sm" className="mt-4">Create Your First Ticket</Button>
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((ticket) => (
            <Card key={ticket.id} className="hover:border-brand-300 transition">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {ticket.ticketNumber || `#${ticket.id}`}
                    </span>
                    {ticket.category && (
                      <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        {ticket.category}
                      </span>
                    )}
                    {(ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL') && (
                      <Badge variant="urgent" pulse>Urgent</Badge>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{ticket.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span>
                      Assigned:{' '}
                      <strong className="text-slate-700">
                        {ticket.assigneeName || 'Unassigned'}
                      </strong>
                    </span>
                    <span>Updated {formatDate(ticket.updatedAt)}</span>
                    {ticket.department && <span>{ticket.department}</span>}
                  </div>
                </div>

                 <div className="flex items-center gap-3 flex-shrink-0">
                   <Badge variant={STATUS_VARIANT[ticket.status] || 'default'}>
                     {ticket.status?.replace('_', ' ')}
                   </Badge>
                   {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && !ticket.hasFeedback && (
                     <Badge variant="progress" className="text-[10px]">
                       &#9733; Rate Support
                     </Badge>
                   )}
                   <Link href={`/portal/tickets/${ticket.id}`}>
                     <Button variant="outline" size="sm">View Details →</Button>
                   </Link>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
