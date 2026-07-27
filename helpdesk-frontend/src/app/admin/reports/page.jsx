'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const agentPerformance = [
  { name: 'Abebe Bikila', team: 'NOC', resolved: 24, avg: '3.1h', slaCompliance: 97, avatar: 'AB' },
  { name: 'Tigist Alemu', team: 'Tier-1', resolved: 31, avg: '1.8h', slaCompliance: 99, avatar: 'TA' },
  { name: 'Dawit Isaac', team: 'App Support', resolved: 18, avg: '4.5h', slaCompliance: 89, avatar: 'DI' },
  { name: 'Mekdes Girma', team: 'NOC', resolved: 12, avg: '2.9h', slaCompliance: 94, avatar: 'MG' },
];

const categoryBreakdown = [
  { name: 'Software & Email', count: 34, pct: 38, color: 'bg-violet-500' },
  { name: 'Hardware & Devices', count: 27, pct: 30, color: 'bg-brand-500' },
  { name: 'Network & VPN', count: 18, pct: 20, color: 'bg-emerald-500' },
  { name: 'Accounts & SSO', count: 11, pct: 12, color: 'bg-amber-500' },
];

const recentTickets = [
  { id: 'TK-8945', title: 'Critical DB latency spikes', priority: 'CRITICAL', status: 'OPEN', dept: 'Cyber', time: '24 min ago' },
  { id: 'TK-8941', title: 'VPN drops after 10min idle', priority: 'HIGH', status: 'IN_PROGRESS', dept: 'Finance', time: '12 min ago' },
  { id: 'TK-8940', title: 'Outlook attachment limit error', priority: 'MEDIUM', status: 'RESOLVED', dept: 'HR', time: '1h ago' },
  { id: 'TK-8938', title: 'Dual monitor setup request', priority: 'MEDIUM', status: 'OPEN', dept: 'IT', time: '2h ago' },
  { id: 'TK-8935', title: 'AD password reset for Kassahun', priority: 'LOW', status: 'RESOLVED', dept: 'Legal', time: '3h ago' },
];

const periodOptions = ['Today', 'This Week', 'This Month', 'This Quarter'];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('This Week');

  return (
    <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="text-xs text-slate-500 mt-1">
                Helpdesk performance metrics, SLA compliance, and team productivity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {periodOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    period === p ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Tickets" value="90" trend="+12% vs last period" trendDirection="up" accentColor="brand" />
            <StatsCard title="Resolved" value="72" trend="80% resolution rate" trendDirection="up" accentColor="emerald" />
            <StatsCard title="SLA Breached" value="4" trend="-2 vs last period" trendDirection="down" accentColor="rose" />
            <StatsCard title="Avg. Resolution" value="2.8h" trend="-0.4h improvement" trendDirection="up" accentColor="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Category Breakdown */}
            <Card glass>
              <CardHeader><CardTitle className="text-sm">Tickets by Category</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                      <span className="text-xs font-bold text-slate-500">{cat.count} tickets</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`${cat.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cat.pct}% of total</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SLA Compliance Ring */}
            <Card glass>
              <CardHeader><CardTitle className="text-sm">SLA Compliance Rate</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 flex flex-col items-center">
                {/* Visual ring */}
                <div className="relative w-36 h-36 my-4">
                  <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="96, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">96%</span>
                    <span className="text-[10px] text-slate-500">compliance</span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {[
                    { label: 'Within SLA', count: 86, color: 'bg-emerald-500' },
                    { label: 'Breached', count: 4, color: 'bg-rose-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-slate-600">{label}</span>
                      </div>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card glass>
              <CardHeader><CardTitle className="text-sm">Ticket Status Breakdown</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                {[
                  { status: 'Open', count: 14, color: 'text-brand-700 bg-brand-50 border-brand-200' },
                  { status: 'In Progress', count: 8, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { status: 'On Hold', count: 2, color: 'text-slate-700 bg-slate-50 border-slate-200' },
                  { status: 'Resolved', count: 58, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { status: 'Closed', count: 8, color: 'text-slate-600 bg-slate-100 border-slate-300' },
                ].map(({ status, count, color }) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${color}`}>{status}</span>
                    <span className="text-sm font-bold text-slate-800">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Agent Performance Table */}
          <Card glass className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Agent Performance</CardTitle>
              <Button variant="outline" size="sm">Export CSV</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="p-3.5 pl-6">Agent</th>
                      <th className="p-3.5">Team</th>
                      <th className="p-3.5">Resolved</th>
                      <th className="p-3.5">Avg Resolution Time</th>
                      <th className="p-3.5">SLA Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {agentPerformance.map((agent) => (
                      <tr key={agent.name} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center">
                              {agent.avatar}
                            </div>
                            <span className="font-bold text-slate-900">{agent.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600">{agent.team}</td>
                        <td className="p-3.5 font-bold text-slate-900">{agent.resolved}</td>
                        <td className="p-3.5 font-mono text-slate-700">{agent.avg}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${agent.slaCompliance >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${agent.slaCompliance}%` }}
                              />
                            </div>
                            <span className={`font-bold ${agent.slaCompliance >= 95 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {agent.slaCompliance}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Tickets</CardTitle>
              <Button variant="outline" size="sm">View All →</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="p-3.5 pl-6">Ticket</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Dept</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-6 font-mono font-bold text-brand-600">{t.id}</td>
                        <td className="p-3.5 font-medium text-slate-800 max-w-xs truncate">{t.title}</td>
                        <td className="p-3.5 text-slate-600">{t.dept}</td>
                        <td className="p-3.5">
                          <Badge variant={t.priority === 'CRITICAL' ? 'urgent' : t.priority === 'HIGH' ? 'urgent' : 'progress'} pulse={t.priority === 'CRITICAL'}>
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <Badge variant={t.status === 'RESOLVED' ? 'resolved' : t.status === 'IN_PROGRESS' ? 'progress' : 'open'}>
                            {t.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-slate-500">{t.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
    </>
  );
}
