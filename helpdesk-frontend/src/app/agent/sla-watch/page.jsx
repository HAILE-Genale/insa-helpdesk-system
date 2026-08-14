'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SlaCountdown, getSlaStatus } from '@/components/sla/SlaCountdown';
import { getTickets } from '@/lib/api/tickets';

const PRIORITY_VARIANT = { CRITICAL: 'urgent', HIGH: 'urgent', MEDIUM: 'progress', LOW: 'default' };

export default function AgentSLAWatchPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getTickets()
      .then((res) => {
        const all = res?.data ?? res ?? [];
        // Only active tickets with an SLA deadline matter for the watchlist.
        const watchlist = all.filter((t) =>
          t.slaDeadline && ['OPEN', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status)
        );
        // Sort by most urgent first (closest deadline / violated first).
        watchlist.sort((a, b) => {
          if (a.slaViolated !== b.slaViolated) return a.slaViolated ? -1 : 1;
          return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
        });
        setTickets(watchlist);
      })
      .catch((err) => setError('Failed to load tickets. ' + (err.message || '')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const breachedCount = tickets.filter((t) => t.slaViolated || getSlaStatus(t.slaDeadline) === 'BREACHED').length;
  const imminentCount = tickets.filter((t) => !t.slaViolated && ['CRITICAL', 'WARNING'].includes(getSlaStatus(t.slaDeadline))).length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SLA Breach Watchlist</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring of tickets approaching SLA response or resolution deadlines.
          </p>
        </div>
        <Link href="/agent/tickets">
          <Button variant="danger" size="sm">
            🚨 Escalate Critical Breach
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Breached</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{breachedCount}</p>
        </div>
        <div className="glass-card rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">At Risk</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{imminentCount}</p>
        </div>
        <div className="glass-card rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">On Track</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {tickets.filter((t) => !t.slaViolated && getSlaStatus(t.slaDeadline) === 'ON_TRACK').length}
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-6 text-sm text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">{error}</div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-sm glass-card rounded-2xl border border-slate-200/80">
          No active tickets with SLA deadlines. 🎉
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((item) => {
            const status = item.slaViolated ? 'BREACHED' : getSlaStatus(item.slaDeadline);
            const isBreach = status === 'BREACHED';
            const isCritical = status === 'CRITICAL' || status === 'WARNING';

            return (
              <Card
                key={item.id}
                glass
                className={`border-l-4 ${
                  isBreach ? 'border-l-rose-600 bg-rose-50/20' :
                  isCritical ? 'border-l-amber-500' :
                  'border-l-emerald-500'
                }`}
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/agent/tickets/${item.id}`}
                        className="font-mono text-xs font-bold text-brand-600 hover:underline"
                      >
                        {item.ticketNumber || `#${item.id}`}
                      </Link>
                      <Badge variant={PRIORITY_VARIANT[item.priority] || 'default'} pulse={isBreach}>
                        {item.priority}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Agent: <strong className="text-slate-800">{item.assigneeName || 'Unassigned'}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <SlaCountdown deadline={item.slaDeadline} violated={item.slaViolated} size="lg" />
                    <Link href={`/agent/tickets/${item.id}`}>
                      <Button variant={isBreach ? 'danger' : 'primary'} size="sm">
                        {isBreach ? 'Take Immediate Action →' : 'View Ticket →'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}