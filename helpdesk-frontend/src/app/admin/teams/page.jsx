'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { getTeams, createTeam, updateTeam, addTeamMember, removeTeamMember } from '@/lib/api/teams';
import { getUsers } from '@/lib/api/users';

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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null); // null = create, object = edit
  const [form, setForm] = useState({ name: '', description: '', isDefault: false, routingCategories: '' });
  const [saving, setSaving] = useState(false);

  // Add-agent modal state
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [addAgentTeamId, setAddAgentTeamId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [busyId, setBusyId] = useState(null); // for remove-member button spinner

  const loadTeams = () => {
    setLoading(true);
    getTeams()
      .then((res) => setTeams(res?.data ?? []))
      .catch((err) => setError(err?.message ?? 'Failed to load teams'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeams();
    getUsers()
      .then((res) => setUsers(res?.data ?? []))
      .catch(() => setUsers([])); // users are optional; ignore failure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingTeam(null);
    setForm({ name: '', description: '', isDefault: false, routingCategories: '' });
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setForm({
      name: team.name || '',
      description: team.description || '',
      isDefault: team.isDefault || false,
      routingCategories: (team.routingRules || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        isDefault: form.isDefault,
        routingCategories: form.routingCategories
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingTeam) {
        const res = await updateTeam(editingTeam.id, payload);
        const updated = res?.data;
        if (updated) {
          setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? updated : t)));
        }
      } else {
        const res = await createTeam(payload);
        const created = res?.data;
        if (created) setTeams((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err?.message ?? 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAgent = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const res = await addTeamMember(addAgentTeamId, Number(selectedUserId));
      const updated = res?.data;
      if (updated) {
        setTeams((prev) => prev.map((t) => (t.id === addAgentTeamId ? updated : t)));
      }
      setShowAddAgent(false);
      setSelectedUserId('');
    } catch (err) {
      setError(err?.message ?? 'Failed to add agent');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    setBusyId(`${teamId}-${userId}`);
    try {
      const res = await removeTeamMember(teamId, userId);
      const updated = res?.data;
      if (updated) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
      }
    } catch (err) {
      setError(err?.message ?? 'Failed to remove agent');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        Loading teams…
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
        <Button variant="primary" size="sm" onClick={openCreate}>+ Create Team</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </div>
      )}

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
                    <Button variant="ghost" size="sm" onClick={() => openEdit(team)}>Edit</Button>
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
                      <button
                        className={`text-[11px] font-semibold ${colors.text} hover:underline`}
                        onClick={() => { setAddAgentTeamId(team.id); setSelectedUserId(''); setShowAddAgent(true); }}
                      >
                        + Add Agent
                      </button>
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
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">{agent.openTickets} open</span>
                            <button
                              onClick={() => handleRemoveMember(team.id, agent.id)}
                              disabled={busyId === `${team.id}-${agent.id}`}
                              className="text-[10px] font-semibold text-rose-500 hover:underline disabled:opacity-50"
                            >
                              {busyId === `${team.id}-${agent.id}` ? '…' : 'Remove'}
                            </button>
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

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingTeam ? `Edit Team: ${editingTeam.name}` : 'Create Team'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <Input
                label="Team Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Network Operations"
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="What does this team handle?"
              />
              <Input
                label="Routing Categories (comma-separated)"
                value={form.routingCategories}
                onChange={(e) => setForm((f) => ({ ...f, routingCategories: e.target.value }))}
                placeholder="Network & VPN, Accounts & SSO"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                Default team (fallback for unmatched categories)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.name.trim()}>
                {saving ? 'Saving…' : editingTeam ? 'Save Changes' : 'Create Team'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent modal */}
      {showAddAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add Agent</h2>
              <button onClick={() => setShowAddAgent(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <Select
              label="Select an agent"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              options={users
                .filter((u) => u.active && u.role === 'HELPDESK_AGENT')
                .map((u) => ({ value: String(u.id), label: `${u.username} (${u.email})` }))}
            />

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddAgent(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAddAgent} disabled={saving || !selectedUserId}>
                {saving ? 'Adding…' : 'Add to Team'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
