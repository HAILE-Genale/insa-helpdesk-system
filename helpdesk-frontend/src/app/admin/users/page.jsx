'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getUsers, deactivateUser, activateUser, updateUser } from '@/lib/api/users';
import { getCategories } from '@/lib/api/categories';
import { register } from '@/lib/api/auth';

const DEPARTMENTS = [
  'IT & Infrastructure',
  'Network Operations',
  'Human Resources',
  'Finance & Procurement',
  'Cyber Operations',
  'Legal & Policy',
  'Operations',
  'General',
];

const BACKEND_ROLES = [
  'SYSTEM_ADMIN',
  'HELPDESK_MANAGER',
  'HELPDESK_AGENT',
  'END_USER',
];

const ROLE_COLORS = {
  SYSTEM_ADMIN:      'bg-rose-50 text-rose-700 border-rose-200',
  HELPDESK_MANAGER:  'bg-violet-50 text-violet-700 border-violet-200',
  HELPDESK_AGENT:    'bg-brand-50 text-brand-700 border-brand-200',
  END_USER:          'bg-slate-50 text-slate-600 border-slate-200',
};

// ── Tree expertise picker ─────────────────────────────────────────────
function ExpertisePicker({ allCategories, selected, onChange }) {
  const parents   = allCategories.filter((c) => !c.parentCategoryId);
  const kidsOf    = (pid) => allCategories.filter((c) => c.parentCategoryId === pid);
  const [open, setOpen] = useState({});

  const toggle    = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));
  const pick      = (name) => onChange(
    selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]
  );
  const pickAll   = (parent) => {
    const all = [parent.name, ...kidsOf(parent.id).map((k) => k.name)];
    const allSel = all.every((n) => selected.includes(n));
    onChange(allSel ? selected.filter((s) => !all.includes(s)) : [...new Set([...selected, ...all])]);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        Category Expertise
        <span className="ml-1 text-[10px] text-slate-400 font-normal">(used for auto-routing)</span>
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {selected.map((n) => (
            <span key={n} className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 border border-brand-200">
              {n}
              <button type="button" onClick={() => pick(n)} className="text-brand-400 hover:text-brand-700 leading-none">×</button>
            </span>
          ))}
          <button type="button" onClick={() => onChange([])} className="text-[10px] text-slate-400 hover:text-rose-500">Clear</button>
        </div>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
        {parents.length === 0 && (
          <p className="text-xs text-slate-400 px-3 py-2 text-center">No categories loaded</p>
        )}
        {parents.map((parent) => {
          const kids    = kidsOf(parent.id);
          const isOpen  = !!open[parent.id];
          const someSel = kids.some((k) => selected.includes(k.name));
          const allSel  = kids.length > 0 && kids.every((k) => selected.includes(k.name));
          const parSel  = selected.includes(parent.name);

          return (
            <div key={parent.id} className="border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50">
                <button type="button" onClick={() => toggle(parent.id)}
                  className="w-4 h-4 flex items-center justify-center text-slate-400 flex-shrink-0">
                  {kids.length > 0
                    ? <span className={`text-[9px] transition-transform duration-150 inline-block ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    : <span className="text-[9px] text-slate-300">—</span>}
                </button>
                <input type="checkbox"
                  checked={parSel || allSel}
                  ref={(el) => { if (el) el.indeterminate = !parSel && someSel && !allSel; }}
                  onChange={() => kids.length > 0 ? pickAll(parent) : pick(parent.name)}
                  className="rounded border-slate-300 accent-brand-600 flex-shrink-0" />
                <span onClick={() => kids.length > 0 ? toggle(parent.id) : pick(parent.name)}
                  className={`text-xs font-semibold flex-1 cursor-pointer ${parSel || someSel ? 'text-brand-700' : 'text-slate-800'}`}>
                  {parent.name}
                </span>
                {kids.length > 0 && (
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {kids.filter((k) => selected.includes(k.name)).length}/{kids.length}
                  </span>
                )}
              </div>
              {isOpen && kids.map((kid) => (
                <label key={kid.id} className="flex items-center gap-2 px-3 py-1 pl-9 cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" checked={selected.includes(kid.name)} onChange={() => pick(kid.name)}
                    className="rounded border-slate-300 accent-brand-600 flex-shrink-0" />
                  <span className={`text-xs ${selected.includes(kid.name) ? 'text-brand-700 font-semibold' : 'text-slate-600'}`}>
                    {kid.name}
                  </span>
                </label>
              ))}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        {selected.length} selected · click ▶ to expand
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [categories, setCategories] = useState([]);

  const [showForm,  setShowForm]  = useState(false);
  const [formData,  setFormData]  = useState({
    username: '', email: '', password: '', role: 'END_USER',
    phone: '', location: '', department: '', expertise: [],
  });
  const [formError,   setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [openMenuId,  setOpenMenuId]  = useState(null);
  const [confirmActionUser, setConfirmActionUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    getCategories()
      .then((res) => setCategories((res ?? []).filter((c) => c.active)))
      .catch(() => setCategories([]));
  }, [loadUsers]);

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await register(formData);
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', role: 'END_USER', phone: '', location: '', department: '', expertise: [] });
      await loadUsers();
    } catch (err) {
      setFormError('Failed to create user: ' + (err.message || ''));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEditUser(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await updateUser(editingUser.id, {
        email:      editingUser.email,
        phone:      editingUser.phone,
        location:   editingUser.location,
        department: editingUser.department,
        expertise:  editingUser.expertise || [],
      });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setFormError('Failed to update user: ' + (err.message || ''));
    } finally {
      setFormLoading(false);
    }
  }

  async function executeToggleStatus() {
    if (!confirmActionUser) return;
    const user = confirmActionUser;
    setConfirmActionUser(null);
    setUsers(users.map(u => u.id === user.id ? { ...u, active: !user.active } : u));
    try {
      user.active ? await deactivateUser(user.id) : await activateUser(user.id);
      loadUsers();
    } catch (err) {
      setError(`Failed to ${user.active ? 'deactivate' : 'activate'} user: ` + err.message);
      setUsers(users.map(u => u.id === user.id ? { ...u, active: user.active } : u));
    }
  }

  const setF  = (f) => (e) => { setFormData(p => ({ ...p, [f]: e.target.value }));  setFormError(''); };
  const setEF = (f) => (e) => { setEditingUser(p => ({ ...p, [f]: e.target.value })); setFormError(''); };

  const totalPages     = Math.ceil(users.length / itemsPerPage);
  const safePage       = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedUsers = users.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const inputCls = 'w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none';

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage accounts, roles, departments, and category expertise.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(!showForm); setEditingUser(null); }}>
          {showForm ? '✕ Cancel' : '+ Create User'}
        </Button>
      </div>

      {/* ── Create form ───────────────────────────────────────────── */}
      {showForm && !editingUser && (
        <Card glass className="mb-6">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Fill in all details to register a new account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <input type="text" required minLength={3} value={formData.username} onChange={setF('username')} placeholder="e.g. john.doe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={setF('email')} placeholder="john@insa.gov.et" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input type="password" required minLength={8} value={formData.password} onChange={setF('password')} placeholder="Min 8 characters" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                  <select required value={formData.role} onChange={setF('role')} className={inputCls}>
                    {BACKEND_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select value={formData.department} onChange={setF('department')} className={inputCls}>
                    <option value="">— Select department —</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={setF('phone')} placeholder="+251 ..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={setF('location')} placeholder="e.g. Building A, Floor 2" className={inputCls} />
                </div>
              </div>

              {/* Expertise tree — only show for agent/manager roles */}
              {['HELPDESK_AGENT', 'HELPDESK_MANAGER'].includes(formData.role) && (
                <ExpertisePicker
                  allCategories={categories}
                  selected={formData.expertise}
                  onChange={(v) => setFormData(p => ({ ...p, expertise: v }))}
                />
              )}

              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl">
                  ⚠️ {formError}
                </div>
              )}
              <Button type="submit" variant="primary" size="sm" disabled={formLoading}>
                {formLoading ? 'Creating…' : 'Create User'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Edit form ─────────────────────────────────────────────── */}
      {editingUser && (
        <Card glass className="mb-6 border-brand-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Edit: {editingUser.username}</CardTitle>
              <CardDescription>{editingUser.role} · {editingUser.department || 'No department'}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>✕ Close</Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input type="email" required value={editingUser.email} onChange={setEF('email')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select value={editingUser.department || ''} onChange={setEF('department')} className={inputCls}>
                    <option value="">— Select department —</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={editingUser.phone || ''} onChange={setEF('phone')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input type="text" value={editingUser.location || ''} onChange={setEF('location')} className={inputCls} />
                </div>
              </div>

              {['HELPDESK_AGENT', 'HELPDESK_MANAGER'].includes(editingUser.role) && (
                <ExpertisePicker
                  allCategories={categories}
                  selected={editingUser.expertise || []}
                  onChange={(v) => setEditingUser(p => ({ ...p, expertise: v }))}
                />
              )}

              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl">
                  ⚠️ {formError}
                </div>
              )}
              <Button type="submit" variant="primary" size="sm" disabled={formLoading}>
                {formLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* ── User table ────────────────────────────────────────────── */}
      <Card glass>
        <CardHeader>
          <CardTitle>System Accounts</CardTitle>
          <CardDescription>{loading ? 'Loading…' : `${users.length} registered users`}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">
                    <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin mr-2" />
                    Loading users…
                  </td></tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No users found.</td></tr>
                ) : paginatedUsers.map((u, idx) => {
                  const nearBottom = idx >= paginatedUsers.length - 2;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {u.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.username}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ROLE_COLORS[u.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{u.department || '—'}</td>
                      <td className="p-3.5 text-slate-600">{u.phone || '—'}</td>
                      <td className="p-3.5 text-slate-600">{u.location || '—'}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          u.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-5 relative">
                        <Button variant="ghost" size="sm" onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          className="text-slate-600 hover:bg-slate-100 px-2 h-7">
                          <span className="text-lg leading-none">⋮</span>
                        </Button>
                        {openMenuId === u.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className={`absolute right-5 z-50 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 ${nearBottom ? 'bottom-8' : 'top-8'}`}>
                              <button onClick={() => { setEditingUser({ ...u }); setShowForm(false); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                Edit
                              </button>
                              <button onClick={() => { setConfirmActionUser(u); setOpenMenuId(null); }}
                                className={`w-full text-left px-4 py-2.5 text-sm ${u.active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                {u.active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                {(safePage - 1) * itemsPerPage + 1}–{Math.min(safePage * itemsPerPage, users.length)} of {users.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <span className="text-xs text-slate-600 px-2">Page {safePage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Confirm modal ─────────────────────────────────────────── */}
      {confirmActionUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-slate-200">
            <CardHeader>
              <CardTitle>{confirmActionUser.active ? 'Deactivate' : 'Activate'} Account</CardTitle>
              <CardDescription>
                {confirmActionUser.active
                  ? `${confirmActionUser.username} will immediately lose system access.`
                  : `${confirmActionUser.username} will regain system access.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmActionUser(null)}>Cancel</Button>
              <Button variant="primary" size="sm"
                className={confirmActionUser.active ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                onClick={executeToggleStatus}>
                Yes, {confirmActionUser.active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
