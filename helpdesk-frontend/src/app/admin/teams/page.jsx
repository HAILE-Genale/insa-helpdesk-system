'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const teams = [
  {
    id: 'TEAM-01',
    name: 'Tier-1 Helpdesk',
    description: 'First line of support — general issues, password resets, basic troubleshooting.',
    agents: [
      { name: 'Tigist Alemu',   email: 'tigist.a@insa.gov.et',  avatar: 'TA', open: 3 },
      { name: 'Solomon Hailu',  email: 'solomon.h@insa.gov.et', avatar: 'SH', open: 2 },
    ],
    routingRules: ['Accounts & SSO', 'Hardware (General)'],
    color: 'brand',
  },
  {
    id: 'TEAM-02',
    name: 'Network Operations (NOC)',
    description: 'Manages network infrastructure, VPN, connectivity, and LAN/WAN issues.',
    agents: [
      { name: 'Abebe Bikila', email: 'abebe.b@insa.gov.et', avatar: 'AB', open: 5 },
      { name: 'Mekdes Girma', email: 'mekdes.g@insa.gov.et', avatar: 'MG', open: 1 },
    ],
    routingRules: ['Network & VPN'],
    color: 'emerald',
  },
  {
    id: 'TEAM-03',
    name: 'Application Support',
    description: 'Handles ERP, email, OS, and software licensing issues.',
    agents: [
      { name: 'Dawit Isaac', email: 'dawit.i@insa.gov.et', avatar: 'DI', open: 7 },
    ],
    routingRules: ['Software & Email'],
    color: 'violet',
  },
  {
    id: 'TEAM-04',
    name: 'IAM & Directory',
    description: 'Manages Active Directory, user provisioning, and RBAC access permissions.',
    agents: [
      { name: 'Yonas Tesfaye', email: 'yonas.t@insa.gov.et', avatar: 'YT', open: 2 },
    ],
    routingRules: ['Accounts & SSO', 'AD Account Access'],
    color: 'amber',
  },
];

const colorMap = {
  brand:   { bg: 'bg-brand-100',   text: 'text-brand-700',   border: 'border-brand-200',   badge: 'bg-brand-50 text-brand-700 border-brand-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function AdminTeamsPage() {
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
            Tickets are automatically routed to teams based on selected Category. Unmatched categories fall back to Tier-1 Helpdesk.
            Manual reassignment is always available.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => {
          const colors = colorMap[team.color] || colorMap.brand;
          return (
            <Card key={team.id} glass className={`border ${colors.border}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-base flex-shrink-0`}>
                      👥
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400">{team.id}</span>
                      <h3 className="text-sm font-bold text-slate-900">{team.name}</h3>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{team.description}</p>

                {/* Routing Rules */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Auto-Routes From</p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.routingRules.map((rule) => (
                      <span key={rule} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colors.badge}`}>
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agents */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agents ({team.agents.length})</p>
                    <button className={`text-[11px] font-semibold ${colors.text} hover:underline`}>+ Add Agent</button>
                  </div>
                  <div className="space-y-2">
                    {team.agents.map((agent) => (
                      <div key={agent.email} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${colors.bg} ${colors.text} text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                            {agent.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{agent.name}</div>
                            <div className="text-[9px] text-slate-500">{agent.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-500">{agent.open} open</span>
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
    </>
  );
}
