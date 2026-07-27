'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';

export default function AgentQueuePage() {
  const agentQueue = [
    {
      id: 'TK-8945',
      user: 'Haile Selassie',
      department: 'Cyber Security',
      subject: 'Critical database access latency spikes',
      priority: 'CRITICAL',
      status: 'OPEN',
      slaTimer: '24 mins remaining',
      slaWarning: true,
    },
    {
      id: 'TK-8941',
      user: 'Bethlehem Tadesse',
      department: 'Finance',
      subject: 'VPN Connection drops after 10 minutes',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      slaTimer: '2h 15m remaining',
      slaWarning: false,
    },
    {
      id: 'TK-8930',
      user: 'Dawit Isaac',
      department: 'HR',
      subject: 'New hire email setup & hardware provision',
      priority: 'MEDIUM',
      status: 'OPEN',
      slaTimer: '5h 40m remaining',
      slaWarning: false,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Ticket Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time incident response queue & SLA breach monitor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">⚙️ Queue Filters</Button>
          <Button variant="primary" size="sm">+ Take Next Ticket</Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Unassigned Queue" value="12" trend="3 SLA urgent"   trendDirection="up" accentColor="amber" />
        <StatsCard title="Assigned to Me"   value="5"  trend="2 In Progress"  trendDirection="up" accentColor="brand" />
        <StatsCard title="Resolved Today"   value="18" trend="+14% vs avg"    trendDirection="up" accentColor="emerald" />
      </div>

      {/* Queue Data Table */}
      <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Incoming Support Requests</h3>
          <span className="text-xs font-semibold text-slate-500">Auto-refreshing every 30s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                <th className="p-3.5 pl-5">Ticket ID</th>
                <th className="p-3.5">User / Dept</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">SLA Countdown</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {agentQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 pl-5 font-mono font-bold text-brand-600">{item.id}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.user}</div>
                    <div className="text-[10px] text-slate-500">{item.department}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{item.subject}</td>
                  <td className="p-3.5">
                    {item.priority === 'CRITICAL' ? (
                      <Badge variant="urgent" pulse>CRITICAL</Badge>
                    ) : (
                      <Badge variant="progress">{item.priority}</Badge>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`font-mono font-semibold px-2 py-0.5 rounded-md ${
                      item.slaWarning ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                    }`}>
                      ⏱️ {item.slaTimer}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <Link href={`/agent/tickets/${item.id}`}>
                      <Button variant="primary" size="sm">Assign & Open →</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
