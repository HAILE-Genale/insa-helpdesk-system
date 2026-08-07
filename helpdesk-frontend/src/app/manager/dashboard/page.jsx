'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { getTickets, manualAssignTicket, updateTicketStatus } from '@/lib/api/tickets';
import { getMyTeams } from '@/lib/api/teams';

const STATUS_COLORS = {
  OPEN:                    'bg-brand-50 text-brand-700 border-brand-200',
  IN_PROGRESS:             'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_USER_RESPONSE:   'bg-purple-50 text-purple-700 border-purple-200',
  ASSIGNED:                'bg-sky-50 text-sky-700 border-sky-200',
  RESOLVED:                'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED:                  'bg-slate-100 text-slate-500 border-slate-200',
};

const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-300',
  HIGH:     'bg-rose-50 text-rose-700 border-rose-200',
  MEDIUM:   'bg-amber-50 text-amber-700 border-amber-200',
  LOW:      'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER_RESPONSE', 'RESOLVED', 'CLOSED'];

export default function ManagerDashboardPage() {
  const [tickets, setTickets]       = useState([]);
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filters
  const [statusFilter, setStatusFilter]     = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch]                 = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Reassign modal
  const [reassigning, setReassigning]         = useState(null); // ticket being reassigned
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignError, setReassignError]     = useState('');

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketRes, teamRes] = await Promise.all([getTickets(), getMyTeams()]);
      const ticketList = ticketRes?.data ?? ticketRes ?? [];
      const teamList   = teamRes?.data   ?? teamRes   ?? [];
      setTickets(Array.isArray(ticketList) ? ticketList : []);
      setTeams(Array.isArray(teamList) ? teamList : []);
    } catch (err) {
      setError('Failed to load data: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const open       = tickets.filter(t => t.status === 'OPEN').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const resolved   = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const unassigned = tickets.filter(t => !t.assigneeId && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

  // All agents from team members
  const allAgents = teams.flatMap(team =>
    (team.members || []).map(m => ({ ...m, teamName: team.name }))
  ).filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i); // dedupe

  // ── Filtered + searched tickets ──────────────────────────────────────────────
  const filtered = tickets.filter(t => {
    const matchStatus   = statusFilter === 'ALL' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const q = search.toLowerCase();
    const matchSearch   = !q ||
      (t.ticketNumber || '').toLowerCase().includes(q) ||
      (t.title || '').toLowerCase().includes(q) ||
      (t.reporterName || '').toLowerCase().includes(q) ||
      (t.assigneeName || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // ── Reassign handler ─────────────────────────────────────────────────────────
  async function handleReassign(e) {
    e.preventDefault();
    if (!selectedAgentId) return;
    setReassignLoading(true);
    setReassignError('');

    const agentId = Number(selectedAgentId);
    const agent   = allAgents.find(a => a.id === agentId);

    try {
      const res = await manualAssignTicket(reassigning.id, agentId);
      const updated = res?.data ?? res;

      // Optimistic + server-confirmed update: replace the ticket in state immediately
      setTickets(prev => prev.map(t =>
        t.id === reassigning.id
          ? {
              ...t,
              assigneeId:    agentId,
              assigneeName:  updated?.assigneeName  ?? agent?.username ?? String(agentId),
              assigneeEmail: updated?.assigneeEmail ?? agent?.email    ?? '',
            }
          : t
      ));

      setReassigning(null);
      setSelectedAgentId('');

      // Background refresh to sync any other changes (status, etc.)
      loadData();
    } catch (err) {
      setReassignError(err.message || 'Reassignment failed.');
    } finally {
      setReassignLoading(false);
    }
  }

  function openReassign(ticket) {
    setReassigning(ticket);
    setSelectedAgentId(ticket.assigneeId ? String(ticket.assigneeId) : '');
    setReassignError('');
  }

  // ── Agent workload (from teams) ───────────────────────────────────────────────
  const agentLoad = allAgents.map(agent => ({
    ...agent,
    open: tickets.filter(t =>
      t.assigneeId === agent.id &&
      !['RESOLVED', 'CLOSED'].includes(t.status)
    ).length,
  })).sort((a, b) => b.open - a.open);

  // ── Escalations (HIGH/CRITICAL + not resolved) ───────────────────────────────
  const escalations = tickets.filter(t =>
    (t.priority === 'HIGH' || t.priority === 'CRITICAL') &&
    !['RESOLVED', 'CLOSED'].includes(t.status)
  ).slice(0, 5);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Your team's tickets — monitor, escalate, and reassign as needed.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </Button>
      </div>

      {error && (
        <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <StatsCard title="Open"       value={String(open)}       trend="Need attention"   trendDirection="up"   accentColor="brand"   />
        <StatsCard title="In Progress" value={String(inProgress)} trend="Being worked on"  trendDirection="up"   accentColor="amber"   />
        <StatsCard title="Unassigned" value={String(unassigned)} trend="Awaiting agent"   trendDirection="up"   accentColor="rose"    />
        <StatsCard title="Resolved"   value={String(resolved)}   trend="Completed"        trendDirection="down" accentColor="emerald" />
      </div>

      {/* Escalations */}
      {escalations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-rose-600">🚨</span>
            <h2 className="text-sm font-bold text-slate-800">Escalations Requiring Attention</h2>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
              {escalations.length}
            </span>
          </div>
          <div className="space-y-2">
            {escalations.map(esc => (
              <Card key={esc.id} className="border-rose-200 bg-rose-50/40">
                <CardContent className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-rose-600 shrink-0">
                      {esc.ticketNumber || `#${esc.id}`}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{esc.title}</p>
                      <p className="text-xs text-slate-500">
                        {esc.assigneeName
                          ? <>Assigned to: <strong>{esc.assigneeName}</strong></>
                          : <span className="text-rose-600 font-semibold">⚠ Unassigned</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${PRIORITY_COLORS[esc.priority] || ''}`}>
                      {esc.priority}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => openReassign(esc)}>
                      Reassign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Ticket Table ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search by title, number, reporter…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:border-brand-400"
            />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white/70 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select
              value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white/70 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              {['CRITICAL','HIGH','MEDIUM','LOW'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">
                Team Tickets
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-h-[200px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="p-3 pl-5">Ticket</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assignee</th>
                      <th className="p-3">Team</th>
                      <th className="p-3 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin mr-2" />
                          Loading tickets…
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No tickets found.
                        </td>
                      </tr>
                    ) : paginated.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 pl-5">
                          <span className="font-mono text-[11px] text-brand-600 font-bold block">
                            {t.ticketNumber || `#${t.id}`}
                          </span>
                          <span className="text-slate-700 font-medium line-clamp-1 max-w-[180px]">
                            {t.title}
                          </span>
                          {t.reporterName && (
                            <span className="text-[10px] text-slate-400">by {t.reporterName}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${PRIORITY_COLORS[t.priority] || ''}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${STATUS_COLORS[t.status] || ''}`}>
                            {(t.status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          {t.assigneeName
                            ? <span className="font-semibold text-slate-700">{t.assigneeName}</span>
                            : <span className="text-rose-500 font-semibold">Unassigned</span>}
                        </td>
                        <td className="p-3 text-slate-500">
                          {t.category || '—'}
                        </td>
                        <td className="p-3 text-right pr-5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => openReassign(t)}
                            disabled={t.status === 'CLOSED'}
                          >
                            Reassign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-xs text-slate-500">
                    Page {safePage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={safePage === 1}
                      onClick={() => setPage(p => p - 1)} className="h-7 text-xs">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={safePage >= totalPages}
                      onClick={() => setPage(p => p + 1)} className="h-7 text-xs">
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Agent Workload ── */}
        <div>
          <Card glass>
            <CardHeader><CardTitle className="text-sm">Agent Workload</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {loading ? (
                <p className="text-xs text-slate-400">Loading…</p>
              ) : agentLoad.length === 0 ? (
                <p className="text-xs text-slate-400">No agents in your team yet.</p>
              ) : agentLoad.map(agent => {
                const max = Math.max(...agentLoad.map(a => a.open), 1);
                const pct = Math.round((agent.open / max) * 100);
                return (
                  <div key={agent.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {(agent.username || agent.email || '?').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 truncate">{agent.username}</span>
                          <span className="text-[10px] font-semibold text-slate-500 shrink-0 ml-1">
                            {agent.open} open
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{agent.teamName}</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct >= 80 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Unassigned quick-view */}
          {unassigned > 0 && (
            <Card className="mt-4 border-amber-200 bg-amber-50/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-600">⚠</span>
                  <span className="text-sm font-bold text-amber-800">
                    {unassigned} Unassigned {unassigned === 1 ? 'Ticket' : 'Tickets'}
                  </span>
                </div>
                <div className="space-y-2">
                  {tickets
                    .filter(t => !t.assigneeId && !['RESOLVED','CLOSED'].includes(t.status))
                    .slice(0, 5)
                    .map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] text-amber-700 font-bold">
                            {t.ticketNumber || `#${t.id}`}
                          </span>
                          <p className="text-xs text-slate-700 truncate">{t.title}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 shrink-0"
                          onClick={() => openReassign(t)}>
                          Assign
                        </Button>
                      </div>
                    ))}
                  {unassigned > 5 && (
                    <p className="text-[10px] text-amber-600 text-center pt-1">
                      +{unassigned - 5} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Reassign Modal ── */}
      {reassigning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="w-full max-w-md shadow-2xl border-slate-200 animate-in zoom-in-95 duration-150">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">Reassign Ticket</CardTitle>
                <CardDescription className="mt-1">
                  <span className="font-mono font-bold text-slate-700">
                    {reassigning.ticketNumber || `#${reassigning.id}`}
                  </span>
                  {' — '}
                  <span className="line-clamp-1">{reassigning.title}</span>
                </CardDescription>
              </div>
              <button
                onClick={() => setReassigning(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none mt-0.5"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReassign} className="space-y-4">
                {reassigning.assigneeName && (
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                    Currently assigned to:{' '}
                    <strong className="text-slate-700">{reassigning.assigneeName}</strong>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Agent <span className="text-rose-500">*</span>
                  </label>
                  {allAgents.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                      No agents in your team. Add agents to your team first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {allAgents.map(agent => {
                        const openCount = tickets.filter(t =>
                          t.assigneeId === agent.id && !['RESOLVED','CLOSED'].includes(t.status)
                        ).length;
                        const isSelected = String(selectedAgentId) === String(agent.id);
                        return (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => setSelectedAgentId(String(agent.id))}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition ${
                              isSelected
                                ? 'border-brand-400 bg-brand-50 text-brand-800 font-semibold shadow-sm'
                                : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{agent.username}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                openCount >= 8 ? 'bg-rose-100 text-rose-700' :
                                openCount >= 5 ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {openCount} open
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{agent.teamName}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {reassignError && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                    ⚠ {reassignError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setReassigning(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm"
                    disabled={!selectedAgentId || reassignLoading || allAgents.length === 0}>
                    {reassignLoading ? 'Reassigning…' : 'Confirm Reassignment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
