'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getTeams } from '@/lib/api/teams';

const colorMap = [
  'brand',
  'emerald',
  'violet',
  'amber',
  'rose',
  'sky',
  'teal',
];

const colorClasses = {
  brand:   { bg: 'bg-brand-100',   text: 'text-brand-700',   border: 'border-brand-200',   badge: 'bg-brand-50 text-brand-700 border-brand-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  rose:    { bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  sky:     { bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200',     badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  teal:    { bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-200',    badge: 'bg-teal-50 text-teal-700 border-teal-200' },
};

function initials(name) {
  return name.split(/[\s.@]+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?';
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTeams()
      .then((res) => {
        if (!cancelled) setTeams(res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load teams');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        Loading teams…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-rose-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams & Routing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure support teams, assign agents, and define auto-routing rules per category.
          </p>
        </div>
        <Button variant="primary" size="sm">+ Create Team</Button>
      </div>

      {/* Routing Overview Banner */}
      <Card className="mb-6 bg-brand-50/60 border-brand-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🤖</span>
            <h3 className="text-sm font-bold text-brand-900">Auto-Routing is Active</h3>
            <Badge variant="resolved">ON</Badge>
          </div>
          <p className="text-xs text-brand-800 max-w-2xl">
            Tickets are automatically routed to teams based on selected Category. Unmatched categories fall back to the default team.
            Manual reassignment is always available.
          </p>
        </CardContent>
      </Card>

      {teams.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-sm text-slate-500">No teams configured yet.</p>
          <p className="text-xs text-slate-400 mt-1">Create your first support team to start routing tickets.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team, idx) => {
            const colorName = colorMap[idx % colorMap.length];
            const colors = colorClasses[colorName] || colorClasses.brand;
            const members = team.members ?? [];
            const rules = team.routingRules ?? [];
            return (
              <Card key={team.id} glass className={`border ${colors.border}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-base flex-shrink-0`}>
                        👥
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400">#{team.id}</span>
                        <h3 className="text-sm font-bold text-slate-900">{team.name}</h3>
                        {team.isDefault && (
                          <span className="text-[9px] font-bold text-brand-600">DEFAULT TEAM</span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{team.description}</p>

                  {/* Routing Rules */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Auto-Routes From</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rules.length === 0 ? (
                        <span className="text-[10px] font-semibold text-slate-400">No routing rules</span>
                      ) : rules.map((rule) => (
                        <span key={rule} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colors.badge}`}>
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Agents */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agents ({members.length})</p>
                      <button className={`text-[11px] font-semibold ${colors.text} hover:underline`}>+ Add Agent</button>
                    </div>
                    <div className="space-y-2">
                      {members.length === 0 ? (
                        <p className="text-[10px] text-slate-400">No agents on this team yet.</p>
                      ) : members.map((agent) => (
                        <div key={agent.id ?? agent.username} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${colors.bg} ${colors.text} text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                              {initials(agent.username ?? agent.email ?? '?')}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{agent.username}</div>
                              <div className="text-[9px] text-slate-500">{agent.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-500">{agent.openTickets} open</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
