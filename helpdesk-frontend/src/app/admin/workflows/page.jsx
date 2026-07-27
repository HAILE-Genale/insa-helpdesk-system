'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminWorkflowsPage() {
  const workflows = [
    { id: 'WF-01', name: 'Auto-Assign Network Tickets to NOC Team', status: 'ACTIVE', trigger: 'Ticket Created in "Network" Category' },
    { id: 'WF-02', name: 'Escalate High Priority after 30 mins Inactivity', status: 'ACTIVE', trigger: 'Priority == HIGH && TimeInQueue > 30m' },
    { id: 'WF-03', name: 'Send CSAT Survey on Ticket Resolution', status: 'ACTIVE', trigger: 'Status Changed to RESOLVED' },
  ];

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Automation Workflows</h1>
              <p className="text-xs text-slate-500 mt-1">Configure event-driven trigger rules and automated ticket actions.</p>
            </div>
            <Button variant="primary" size="sm">+ New Workflow Rule</Button>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => (
              <Card key={wf.id} glass className="hover:border-brand-400">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-slate-400 font-bold">{wf.id}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{wf.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Trigger: <code className="bg-slate-100 px-2 py-0.5 rounded text-brand-700">{wf.trigger}</code></p>
                  </div>
                  <Button variant="outline" size="sm">Edit Workflow</Button>
                </CardContent>
              </Card>
            ))}
          </div>
    </>
  );
}
