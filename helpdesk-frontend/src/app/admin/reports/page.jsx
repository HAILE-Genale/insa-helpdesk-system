'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReports } from '@/lib/api/reports';

const periodOptions = ['Today', 'This Week', 'This Month', 'This Quarter'];

const CATEGORY_COLORS = {
  'Software & Email': 'bg-violet-500',
  'Hardware & Devices': 'bg-brand-500',
  'Network & VPN': 'bg-emerald-500',
  'Accounts & SSO': 'bg-amber-500',
};
const FALLBACK_COLORS = ['bg-slate-500', 'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-lime-500'];

function getCategoryColor(name, idx) {
  return CATEGORY_COLORS[name] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

const STATUS_LABEL = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const PRIORITY_VARIANT = { CRITICAL: 'urgent', HIGH: 'urgent', MEDIUM: 'progress', LOW: 'default' };
const STATUS_VARIANT = {
  OPEN: 'open',
  IN_PROGRESS: 'progress',
  ON_HOLD: 'default',
  RESOLVED: 'resolved',
  CLOSED: 'default',
};

function formatResolutionHours(h) {
  return h ? `${h}h` : '\u2014';
}

function formatRelativeTime(iso) {
  if (!iso) return '\u2014';
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} ${diffH === 1 ? 'h' : 'h'} ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString('en-US', { dateStyle: 'medium' });
  } catch {
    return '\u2014';
  }
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('This Week');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getReports()
      .then((res) => {
        if (!cancelled) setReport(res?.data ?? res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load reports.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-100 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-600 font-semibold">{error || 'No report data available.'}</p>
      </div>
    );
  }

  const {
    totalTickets = 0,
    openTickets = 0,
    inProgressTickets = 0,
    onHoldTickets = 0,
    resolvedTickets = 0,
    closedTickets = 0,
    slaBreachedTickets = 0,
    slaComplianceRate = 0,
    avgResolutionHours = 0,
    statusBreakdown = [],
    priorityBreakdown = [],
    categoryBreakdown = [],
    agentPerformance = [],
    avgRating = 0,
    totalFeedback = 0,
    recentTickets = [],
  } = report;

  const resolutionRate = totalTickets > 0 ? Math.round((100 * (resolvedTickets + closedTickets)) / totalTickets) : 0;

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
                period === p
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Tickets"
          value={totalTickets}
          trend={`${resolutionRate}% res. rate`}
          trendDirection="up"
          accentColor="brand"
        />
        <StatsCard
          title="Resolved"
          value={resolvedTickets}
          trend={`${resolutionRate}% resolution rate`}
          trendDirection="up"
          accentColor="emerald"
        />
        <StatsCard
          title="Open"
          value={openTickets}
          trend={`${inProgressTickets} in progress`}
          trendDirection="up"
          accentColor="amber"
        />
        <StatsCard
          title="SLA Breached"
          value={slaBreachedTickets}
          trend={`${100 - slaComplianceRate}% compliance`}
          trendDirection="down"
          accentColor="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category Breakdown */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-sm">Tickets by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No categories yet.</p>
            ) : (
              categoryBreakdown.map((cat, idx) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                    <span className="text-xs font-bold text-slate-500">{cat.count} tickets</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`${getCategoryColor(cat.name, idx)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cat.pct}% of total</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* SLA Compliance Ring */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-sm">SLA Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex flex-col items-center">
            <div className="relative w-36 h-36 my-4">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray={`${slaComplianceRate}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{slaComplianceRate}%</span>
                <span className="text-[10px] text-slate-500">compliance</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {[
                { label: 'Within SLA', count: totalTickets - slaBreachedTickets, color: 'bg-emerald-500' },
                { label: 'Breached', count: slaBreachedTickets, color: 'bg-rose-500' },
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
          <CardHeader>
            <CardTitle className="text-sm">Ticket Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {statusBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No status data.</p>
            ) : (
              statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                      STATUS_VARIANT[s.name]
                        ? 'text-brand-700 bg-brand-50 border-brand-200'
                        : 'text-slate-700 bg-slate-50 border-slate-200'
                    }`}
                  >
                    {STATUS_LABEL[s.name] || s.name}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{s.count}</span>
                </div>
              ))
            )}
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
                {agentPerformance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-xs text-slate-400">
                      No agent data available.
                    </td>
                  </tr>
                ) : (
                  agentPerformance.map((agent) => (
                    <tr key={agent.agentId} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center">
                            {initials(agent.agentName)}
                          </div>
                          <span className="font-bold text-slate-900">{agent.agentName}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">{agent.teamName || '\u2014'}</td>
                      <td className="p-3.5 font-bold text-slate-900">{agent.resolved}</td>
                      <td className="p-3.5 font-mono text-slate-700">{formatResolutionHours(agent.avgResolutionHours)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${agent.slaCompliance >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${agent.slaCompliance}%` }}
                            />
                          </div>
                          <span
                            className={`font-bold ${
                              agent.slaCompliance >= 95 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {agent.slaCompliance}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Summary */}
      <Card glass className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Customer Feedback Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-900">{avgRating.toFixed(1)}</span>
                <span className="text-2xl text-amber-400">
                  {'\u2605'.repeat(Math.round(avgRating))}
                  <span className="text-slate-300">{'\u2605'.repeat(5 - Math.round(avgRating))}</span>
                </span>
              </div>
              <span className="text-xs text-slate-500">from {totalFeedback} feedback submissions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card glass>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Recent Tickets</CardTitle>
          <Link href="/admin/tickets">
            <Button variant="outline" size="sm">View All →</Button>
          </Link>
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
                {recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-xs text-slate-400">
                      No recent tickets.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-6 font-mono font-bold text-brand-600">
                        {t.ticketNumber || `#${t.id}`}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 max-w-xs truncate">{t.title}</td>
                      <td className="p-3.5 text-slate-600">{t.department || '\u2014'}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            t.priority === 'CRITICAL'
                              ? 'urgent'
                              : t.priority === 'HIGH'
                              ? 'urgent'
                              : 'progress'
                          }
                          pulse={t.priority === 'CRITICAL'}
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={STATUS_VARIANT[t.status] || 'default'}
                        >
                          {STATUS_LABEL[t.status] || t.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-500">{formatRelativeTime(t.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
