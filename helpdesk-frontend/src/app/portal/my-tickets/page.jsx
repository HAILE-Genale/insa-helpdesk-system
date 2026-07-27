'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function MyTicketsPage() {
  const [filter, setFilter] = useState('ALL');

  const tickets = [
    {
      id: 'TK-8941',
      title: 'VPN Connection drops after 10 minutes',
      category: 'Network',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      updatedAt: '12 mins ago',
      agent: 'Abebe Bikila',
    },
    {
      id: 'TK-8938',
      title: 'Request for dual monitor setup for workstation',
      category: 'Hardware',
      status: 'OPEN',
      priority: 'MEDIUM',
      updatedAt: '2 hours ago',
      agent: 'Unassigned',
    },
    {
      id: 'TK-8920',
      title: 'Outlook auto-archive folder quota exceeded',
      category: 'Software',
      status: 'RESOLVED',
      priority: 'LOW',
      updatedAt: 'Yesterday',
      agent: 'Tigist Alemu',
    },
  ];

  const filteredTickets =
    filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
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
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:border-brand-300">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {ticket.id}
                  </span>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {ticket.category}
                  </span>
                  {ticket.priority === 'HIGH' && (
                    <Badge variant="urgent" pulse>Urgent</Badge>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{ticket.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Assigned: <strong className="text-slate-700">{ticket.agent}</strong></span>
                  <span>Updated {ticket.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    ticket.status === 'IN_PROGRESS'
                      ? 'progress'
                      : ticket.status === 'RESOLVED'
                      ? 'resolved'
                      : 'open'
                  }
                >
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Link href={`/portal/tickets/${ticket.id}`}>
                  <Button variant="outline" size="sm">View Details →</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
