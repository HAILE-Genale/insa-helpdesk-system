'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminAuditLogsPage() {
  const logs = [
    { id: 'LOG-902', timestamp: 'Today 11:42 AM', actor: 'Admin (Haile-Genale)', action: 'Updated SLA Policy for CRITICAL priority', ip: '10.20.4.12' },
    { id: 'LOG-901', timestamp: 'Today 10:15 AM', actor: 'Agent (Abebe Bikila)', action: 'Resolved ticket #TK-8941', ip: '10.20.4.55' },
    { id: 'LOG-900', timestamp: 'Yesterday 04:30 PM', actor: 'System Auto-Trigger', action: 'Escalated ticket #TK-8930 due to SLA warning', ip: 'LOCALHOST' },
  ];

  return (
    <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
            <p className="text-xs text-slate-500 mt-1">Immutable security trail of system configuration changes and administrative actions.</p>
          </div>

          <Card glass>
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="p-3.5 pl-6">Log ID</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Action Executed</th>
                    <th className="p-3.5 text-right pr-6">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 pl-6 font-mono font-bold text-slate-400">{log.id}</td>
                      <td className="p-3.5 text-slate-600">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-slate-900">{log.actor}</td>
                      <td className="p-3.5 text-slate-800">{log.action}</td>
                      <td className="p-3.5 text-right pr-6 font-mono text-slate-500">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
    </>
  );
}
