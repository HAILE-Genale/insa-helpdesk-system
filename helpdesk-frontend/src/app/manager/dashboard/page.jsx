'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';

const departmentTickets = [
  { dept: 'Finance & Procurement', open: 5, inProgress: 2, resolved: 18, slaBreached: 1, trend: 'up' },
  { dept: 'Human Resources', open: 3, inProgress: 1, resolved: 12, slaBreached: 0, trend: 'down' },
  { dept: 'IT Infrastructure', open: 7, inProgress: 4, resolved: 24, slaBreached: 2, trend: 'up' },
  { dept: 'Legal & Policy', open: 1, inProgress: 0, resolved: 5, slaBreached: 0, trend: 'down' },
];

const escalations = [
  { id: 'TK-8945', title: 'Critical DB latency spikes', priority: 'CRITICAL', assignedTo: 'Abebe Bikila', sla: '24 min remaining', breach: true },
  { id: 'TK-8930', title: 'Email archiving quota exceeded', priority: 'HIGH', assignedTo: 'Dawit Isaac', sla: '1h 05m remaining', breach: false },
];

export default function ManagerDashboardPage() {
  return (
    <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Department-level ticket monitoring, escalation tracking, and agent workload overview.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Open Tickets" value="16" trend="Across all depts" trendDirection="up" accentColor="brand" />
            <StatsCard title="In Progress" value="7" trend="3 agents active" trendDirection="up" accentColor="amber" />
            <StatsCard title="SLA Breached" value="3" trend="Needs attention" trendDirection="up" accentColor="rose" />
            <StatsCard title="Resolved Today" value="11" trend="+2 vs yesterday" trendDirection="up" accentColor="emerald" />
          </div>

          {/* Escalations Alert */}
          {escalations.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-rose-600 text-base">🚨</span>
                <h2 className="text-sm font-bold text-slate-800">Escalations Requiring Attention</h2>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                  {escalations.length} Active
                </span>
              </div>
              <div className="space-y-3">
                {escalations.map((esc) => (
                  <Card key={esc.id} className="border-rose-200 bg-rose-50/40">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-rose-600">{esc.id}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{esc.title}</p>
                          <p className="text-xs text-slate-600">Assigned to: <strong>{esc.assignedTo}</strong></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="urgent" pulse={esc.breach}>{esc.priority}</Badge>
                        <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-md ${esc.breach ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800'}`}>
                          ⏱️ {esc.sla}
                        </span>
                        <Button variant="outline" size="sm">View →</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="lg:col-span-2">
              <Card glass>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Tickets by Department</CardTitle>
                  <Button variant="outline" size="sm">Export Report</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                          <th className="p-3.5 pl-6">Department</th>
                          <th className="p-3.5 text-center">Open</th>
                          <th className="p-3.5 text-center">In Progress</th>
                          <th className="p-3.5 text-center">Resolved</th>
                          <th className="p-3.5 text-center">SLA Breach</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {departmentTickets.map((row) => (
                          <tr key={row.dept} className="hover:bg-slate-50/80 transition">
                            <td className="p-3.5 pl-6 font-bold text-slate-800">{row.dept}</td>
                            <td className="p-3.5 text-center">
                              <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{row.open}</span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">{row.inProgress}</span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{row.resolved}</span>
                            </td>
                            <td className="p-3.5 text-center">
                              {row.slaBreached > 0 ? (
                                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                  ⚠️ {row.slaBreached}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold">✓ 0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Workload */}
            <div>
              <Card glass>
                <CardHeader><CardTitle className="text-sm">Agent Workload</CardTitle></CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {[
                    { name: 'Abebe Bikila', team: 'NOC', load: 6, max: 10, avatar: 'AB' },
                    { name: 'Tigist Alemu', team: 'Tier-1', load: 4, max: 10, avatar: 'TA' },
                    { name: 'Dawit Isaac', team: 'App Support', load: 8, max: 10, avatar: 'DI' },
                    { name: 'Mekdes Girma', team: 'NOC', load: 3, max: 10, avatar: 'MG' },
                  ].map((agent) => (
                    <div key={agent.name}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {agent.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{agent.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{agent.load}/{agent.max}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{agent.team}</div>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            agent.load >= 8 ? 'bg-rose-500' : agent.load >= 6 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(agent.load / agent.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
    </>
  );
}
