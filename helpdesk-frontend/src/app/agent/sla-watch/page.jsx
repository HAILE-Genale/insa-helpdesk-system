'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AgentSLAWatchPage() {
  const watchlist = [
    {
      id: 'TK-8945',
      subject: 'Core database latency spike impacting ERP system',
      priority: 'CRITICAL',
      assignedTo: 'Abebe Bikila',
      slaTimer: '18 mins remaining',
      status: 'BREACH_IMMINENT',
    },
    {
      id: 'TK-8941',
      subject: 'VPN Connection drops after 10 minutes',
      priority: 'HIGH',
      assignedTo: 'Tigist Alemu',
      slaTimer: '45 mins remaining',
      status: 'ON_TRACK',
    },
  ];

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SLA Breach Watchlist</h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time monitoring of tickets approaching SLA response or resolution deadlines.
              </p>
            </div>
            <Button variant="danger" size="sm">
              🚨 Escalate Critical Breach
            </Button>
          </div>

          <div className="space-y-4">
            {watchlist.map((item) => (
              <Card
                key={item.id}
                glass
                className={`border-l-4 ${
                  item.status === 'BREACH_IMMINENT' ? 'border-l-rose-600 bg-rose-50/20' : 'border-l-amber-500'
                }`}
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{item.id}</span>
                      <Badge variant={item.priority === 'CRITICAL' ? 'urgent' : 'progress'} pulse>
                        {item.priority}
                      </Badge>
                      <span className="text-xs text-slate-500">Agent: <strong className="text-slate-800">{item.assignedTo}</strong></span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.subject}</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 animate-pulse border border-rose-300">
                      ⏱️ {item.slaTimer}
                    </span>
                    <Button variant="primary" size="sm">
                      Take Immediate Action →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
    </>
  );
}
