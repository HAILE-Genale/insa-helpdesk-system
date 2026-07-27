'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminSLAPoliciesPage() {
  const policies = [
    { priority: 'CRITICAL', responseTarget: '15 mins', resolveTarget: '2 hours', escalation: 'Immediate SMS & Email Alert to NOC Lead' },
    { priority: 'HIGH', responseTarget: '30 mins', resolveTarget: '4 hours', escalation: 'Auto-reassign after 1 hour inactivity' },
    { priority: 'MEDIUM', responseTarget: '2 hours', resolveTarget: '24 hours', escalation: 'Standard Queue Routing' },
    { priority: 'LOW', responseTarget: '4 hours', resolveTarget: '48 hours', escalation: 'Standard Queue Routing' },
  ];

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SLA Policy Configuration</h1>
              <p className="text-xs text-slate-500 mt-1">Define Service Level Agreement targets for ticket response & resolution times.</p>
            </div>
            <Button variant="primary" size="sm">+ Create Policy Rule</Button>
          </div>

          <Card glass>
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="p-3.5 pl-6">Priority Level</th>
                    <th className="p-3.5">First Response Target</th>
                    <th className="p-3.5">Resolution Window</th>
                    <th className="p-3.5">Escalation Protocol</th>
                    <th className="p-3.5 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {policies.map((p) => (
                    <tr key={p.priority} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-6 font-bold text-slate-900">{p.priority}</td>
                      <td className="p-3.5 font-mono font-semibold text-brand-600">{p.responseTarget}</td>
                      <td className="p-3.5 font-mono font-semibold text-slate-700">{p.resolveTarget}</td>
                      <td className="p-3.5 text-slate-600">{p.escalation}</td>
                      <td className="p-3.5 text-right pr-6">
                        <Button variant="ghost" size="sm">Edit Rule</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
    </>
  );
}
