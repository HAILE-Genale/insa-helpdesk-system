'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { getTeams, createTeam, updateTeam, addTeamMember, removeTeamMember } from '@/lib/api/teams';
import { getCategories } from '@/lib/api/categories';
import { getUsers } from '@/lib/api/users';

// Common IT support team names mapped to the categories they typically handle
const TEAM_SUGGESTIONS = [
  { name: 'Network Operations (NOC)',       description: 'Handles all network, VPN, and connectivity issues',           categories: ['Network & Connectivity', 'WiFi Issues', 'VPN Access', 'Internet Connectivity', 'Network Printing'] },
  { name: 'Hardware Support',               description: 'Manages hardware issues, repairs, and device provisioning',     categories: ['Hardware', 'Laptop/Desktop', 'Monitors & Displays', 'Keyboards & Mouse', 'USB Devices'] },
  { name: 'Software & Applications',        description: 'Handles software installations, ERP, and app issues',           categories: ['Software', 'Operating System', 'Microsoft Office', 'ERP System', 'CRM System', 'Third-party Applications'] },
  { name: 'Identity & Access Management',   description: 'Manages user accounts, passwords, and permissions',             categories: ['Access & Authentication', 'Password Reset', 'Account Locked', 'Permission Access', 'Multi-Factor Auth'] },
  { name: 'Communication & Collaboration',  description: 'Supports email, Teams, and video conferencing',                 categories: ['Communication Tools', 'Email Issues', 'Collaboration Tools', 'Video Conferencing'] },
  { name: 'Office Equipment & Printing',    description: 'Manages printers, scanners, copiers, and related devices',      categories: ['Office Equipment', 'Printer Setup', 'Print Quality', 'Scanner Issues', 'Copier Issues'] },
  { name: 'Database & Systems',             description: 'Handles databases, servers, backups, and performance issues',   categories: ['Database & Systems', 'Database Access', 'Data Backup', 'Performance Issues', 'Server Issues'] },
  { name: 'Mobile & Remote Support',        description: 'Supports mobile devices and remote work setups',               categories: ['Mobile & Remote', 'Mobile Device Setup', 'Mobile Apps', 'Remote Work Setup'] },
  { name: 'Security & Compliance',          description: 'Handles security incidents, access controls, and compliance',   categories: ['Security & Compliance', 'Security Incident', 'Access Control', 'Compliance'] },
  { name: 'General Helpdesk (Tier 1)',       description: 'First-line support for all general inquiries and requests',     categories: ['General Support', 'User Training', 'License & Asset', 'General Inquiry'] },
];


const colorMap = ['brand', 'emerald', 'violet', 'amber', 'rose', 'sky', 'teal'];
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

/** Team name dropdown with predefined suggestions + custom entry option */
function TeamNamePicker({ value, onChange, onAutoFill }) {
  const [mode, setMode] = useState('select'); // 'select' | 'custom'

  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected === '__custom__') {
      setMode('custom');
      onChange('');
      return;
    }
    const suggestion = TEAM_SUGGESTIONS.find((s) => s.name === selected);
    if (suggestion) {
      onChange(suggestion.name);
      onAutoFill(suggestion);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Team Name <span className="text-rose-500">*</span>
      </label>

      {mode === 'select' ? (
        <>
          <select
            value={value || ''}
            onChange={handleSelect}
            className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition"
          >
            <option value="">— Select a team type —</option>
            {TEAM_SUGGESTIONS.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
            <option value="__custom__">✏️  Custom team name…</option>
          </select>
          {value && (
            <p className="text-[10px] text-slate-400 mt-1">
              {TEAM_SUGGESTIONS.find((s) => s.name === value)?.description}
            </p>
          )}
        </>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom team name…"
            className="flex-1 rounded-xl glass-input px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition"
            autoFocus
          />
          <button
            type="button"
            onClick={() => { setMode('select'); onChange(''); }}
            className="text-xs text-slate-500 hover:text-slate-700 px-2"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}


function CategoryPicker({ allCategories, selected, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = allCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (name) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Routing Categories
        <span className="ml-1 text-[10px] text-slate-400 font-normal">(tickets from these categories auto-route to this team)</span>
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-brand-100 text-brand-700 border border-brand-200"
            >
              {name}
              <button
                type="button"
                onClick={() => toggle(name)}
                className="text-brand-400 hover:text-brand-700 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + list */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs border-b border-slate-200 focus:outline-none focus:border-brand-400"
        />
        <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 px-3 py-3 text-center">No categories found</p>
          )}
          {filtered.map((cat) => {
            const isSelected = selected.includes(cat.name);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition hover:bg-slate-50 ${
                  isSelected ? 'bg-brand-50' : ''
                }`}
              >
                <span className={`font-medium ${isSelected ? 'text-brand-700' : 'text-slate-700'}`}>
                  {cat.name}
                </span>
                {cat.parentCategory && (
                  <span className="text-[10px] text-slate-400">{cat.parentCategory.name}</span>
                )}
                {isSelected && <span className="text-brand-600 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        {selected.length} categor{selected.length === 1 ? 'y' : 'ies'} selected
      </p>
    </div>
  );
}

export default function AdminTeamsPage() {
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers]       = useState([]);

  // Create/Edit modal
  const [showModal, setShowModal]       = useState(false);
  const [editingTeam, setEditingTeam]   = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    isDefault: false,
    selectedCategories: [],  // array of category names
  });
  const [saving, setSaving] = useState(false);

  // Add-agent modal
  const [showAddAgent, setShowAddAgent]     = useState(false);
  const [addAgentTeamId, setAddAgentTeamId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [busyId, setBusyId]                 = useState(null);

  const loadTeams = () => {
    setLoading(true);
    getTeams()
      .then((res) => setTeams(res?.data ?? res ?? []))
      .catch((err) => setError(err?.message ?? 'Failed to load teams'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeams();
    getCategories()
      .then((res) => setCategories((res ?? []).filter((c) => c.active)))
      .catch(() => setCategories([]));
    getUsers()
      .then((res) => setUsers(res?.data ?? res ?? []))
      .catch(() => setUsers([]));
  }, []);

  const openCreate = () => {
    setEditingTeam(null);
    setForm({ name: '', description: '', isDefault: false, selectedCategories: [] });
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setForm({
      name: team.name || '',
      description: team.description || '',
      isDefault: team.isDefault || false,
      selectedCategories: team.routingRules ?? [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        isDefault: form.isDefault,
        routingCategories: form.selectedCategories,
      };
      if (editingTeam) {
        const res = await updateTeam(editingTeam.id, payload);
        const updated = res?.data ?? res;
        if (updated) setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? updated : t)));
      } else {
        const res = await createTeam(payload);
        const created = res?.data ?? res;
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
      const updated = res?.data ?? res;
      if (updated) setTeams((prev) => prev.map((t) => (t.id === addAgentTeamId ? updated : t)));
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
      const updated = res?.data ?? res;
      if (updated) setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
    } catch (err) {
      setError(err?.message ?? 'Failed to remove agent');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="space-y-4 p-8">
        {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />)}
      </div>
    );
  }

  // Agents not already on the selected team
  const availableAgents = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    const memberIds = new Set((team?.members ?? []).map((m) => m.id));
    return users.filter((u) => u.active !== false && !memberIds.has(u.id));
  };

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
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">×</button>
        </div>
      )}

      {/* Routing Overview Banner */}
      <Card className="mb-6 bg-brand-50/60 border-brand-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🤖</span>
            <h3 className="text-sm font-bold text-brand-900">Auto-Routing + Load Balancing Active</h3>
            <Badge variant="resolved">ON</Badge>
          </div>
          <p className="text-xs text-brand-800 max-w-2xl">
            When a ticket is created, it is automatically routed to the matching team based on category.
            Within that team, the ticket is assigned to the agent with the <strong>fewest open tickets</strong>.
            Agents with category expertise are preferred. Unmatched categories fall back to the default team.
          </p>
        </CardContent>
      </Card>

      {teams.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-sm text-slate-500">No teams configured yet.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Create your first support team to start routing tickets.</p>
          <Button variant="primary" size="sm" onClick={openCreate}>+ Create First Team</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team, idx) => {
            const colorName = colorMap[idx % colorMap.length];
            const colors = colorClasses[colorName] || colorClasses.brand;
            const members = team.members ?? [];
            const rules = team.routingRules ?? [];

            // Sort members by open tickets ascending (least loaded first)
            const sortedMembers = [...members].sort((a, b) => a.openTickets - b.openTickets);

            return (
              <Card key={team.id} glass className={`border ${colors.border}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-base flex-shrink-0`}>
                        👥
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-slate-400">#{team.id}</span>
                          {team.isDefault && (
                            <span className="text-[9px] font-bold text-white bg-brand-500 px-1.5 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{team.name}</h3>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(team)}>Edit</Button>
                  </div>

                  {team.description && (
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{team.description}</p>
                  )}

                  {/* Routing Rules */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Auto-Routes From ({rules.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rules.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No routing rules — add categories to route tickets here</span>
                      ) : rules.map((rule) => (
                        <span key={rule} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colors.badge}`}>
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Agents — sorted by load */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Agents ({members.length})
                        </p>
                        {members.length > 0 && (
                          <span className="text-[9px] text-slate-400">sorted by load ↑</span>
                        )}
                      </div>
                      <button
                        className={`text-[11px] font-semibold ${colors.text} hover:underline`}
                        onClick={() => { setAddAgentTeamId(team.id); setSelectedUserId(''); setShowAddAgent(true); }}
                      >
                        + Add Agent
                      </button>
                    </div>

                    <div className="space-y-2">
                      {sortedMembers.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No agents yet — add agents to enable auto-assignment.</p>
                      ) : sortedMembers.map((agent, agentIdx) => {
                        const isLeastLoaded = agentIdx === 0;
                        return (
                          <div
                            key={agent.id ?? agent.username}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                              isLeastLoaded
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${colors.bg} ${colors.text} text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                                {initials(agent.username ?? agent.email ?? '?')}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-800">{agent.username}</span>
                                  {isLeastLoaded && members.length > 1 && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded">
                                      next up
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] text-slate-500">{agent.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                agent.openTickets === 0
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : agent.openTickets >= 5
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {agent.openTickets} open
                              </span>
                              <button
                                onClick={() => handleRemoveMember(team.id, agent.id)}
                                disabled={busyId === `${team.id}-${agent.id}`}
                                className="text-[10px] font-semibold text-rose-500 hover:underline disabled:opacity-50"
                              >
                                {busyId === `${team.id}-${agent.id}` ? '…' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {editingTeam ? `Edit Team: ${editingTeam.name}` : 'Create Team'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <TeamNamePicker
                value={form.name}
                onChange={(name) => setForm((f) => ({ ...f, name }))}
                onAutoFill={(suggestion) => setForm((f) => ({
                  ...f,
                  name: suggestion.name,
                  description: f.description || suggestion.description,
                  selectedCategories: suggestion.categories.filter((cat) =>
                    categories.some((c) => c.name === cat)
                  ),
                }))}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="What does this team handle?"
              />

              {/* Category multi-select */}
              <CategoryPicker
                allCategories={categories}
                selected={form.selectedCategories}
                onChange={(cats) => setForm((f) => ({ ...f, selectedCategories: cats }))}
              />

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span>Default team <span className="text-slate-400 text-xs">(fallback for categories with no routing rule)</span></span>
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

      {/* ── Add Agent Modal ──────────────────────────────────────────── */}
      {showAddAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add Agent to Team</h2>
              <button onClick={() => setShowAddAgent(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Agent</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl glass-input px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition"
            >
              <option value="">— Choose an agent —</option>
              {availableAgents(addAgentTeamId).map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.username} — {u.email}
                </option>
              ))}
            </select>
            {availableAgents(addAgentTeamId).length === 0 && (
              <p className="text-xs text-slate-400 mt-2">All active users are already on this team.</p>
            )}

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
