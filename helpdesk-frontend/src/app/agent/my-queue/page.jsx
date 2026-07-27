'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AgentMyQueuePage() {
  const myTickets = [
    {
      id: 'TK-8941',
      user: 'Bethlehem Tadesse',
      department: 'Finance & Accounts',
      title: 'VPN Connection drops after 10 minutes of inactivity',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedTime: 'Today at 09:15 AM',
      slaRemaining: '1h 45m',
    },
    {
      id: 'TK-8924',
      user: 'Solomon Worku',
      department: 'Software Engineering',
      title: 'Docker daemon permission error on Ubuntu workstation',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assignedTime: 'Yesterday at 04:30 PM',
      slaRemaining: '4h 10m',
    },
    {
      id: 'TK-8910',
      user: 'Marta Hailu',
      department: 'Executive Office',
      title: 'Dual monitor HDMI adapter replacement',
      status: 'ON_HOLD',
      priority: 'LOW',
      assignedTime: '2 days ago',
      slaRemaining: 'Paused (Waiting on Procurement)',
    },
  ];

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Assigned Tickets</h1>
              <p className="text-xs text-slate-500 mt-1">
                Active incidents assigned to your agent account (3 Open / In Progress).
              </p>
            </div>
            <Button variant="primary" size="sm">
              + Pick Up Unassigned Ticket
            </Button>
          </div>

          <div className="space-y-4">
            {myTickets.map((t) => (
              <Card key={t.id} glass className="hover:border-brand-400">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-600">{t.id}</span>
                        <span className="text-xs font-semibold text-slate-500">• {t.user} ({t.department})</span>
                        {t.priority === 'HIGH' && <Badge variant="urgent">HIGH PRIORITY</Badge>}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{t.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={t.status === 'IN_PROGRESS' ? 'progress' : 'default'}>
                        {t.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        ⏱️ SLA: {t.slaRemaining}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Assigned: {t.assignedTime}</span>
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
    </>
  );
}
