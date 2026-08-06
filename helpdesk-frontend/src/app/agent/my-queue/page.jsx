'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getMyQueue } from '@/lib/api/tickets';

export default function AgentMyQueuePage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyQueue()
      .then((res) => {
        if (!cancelled) setTickets(res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load queue');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        Loading your queue…
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Assigned Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active incidents assigned to your agent account.
          </p>
        </div>
        <Button variant="primary" size="sm">
          + Pick Up Unassigned Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-sm text-slate-500">No tickets in your queue right now.</p>
          <p className="text-xs text-slate-400 mt-1">
            Tickets routed to your team will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id} glass className="hover:border-brand-400">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-600">#{t.id}</span>
                      {t.priority === 'HIGH' && <Badge variant="urgent">HIGH PRIORITY</Badge>}
                      {t.category && (
                        <span className="text-xs font-semibold text-slate-500">{t.category}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{t.title}</h3>
                    {t.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'IN_PROGRESS' ? 'progress' : 'default'}>
                      {(t.status ?? 'OPEN').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status: {(t.status ?? 'OPEN').replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Add Internal Note
                    </Button>
                    <Button variant="primary" size="sm">
                      Resolve & Close Ticket →
                    </Button>
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
