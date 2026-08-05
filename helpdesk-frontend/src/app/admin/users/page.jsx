'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getUsers, deactivateUser, activateUser, updateUser } from '@/lib/api/users';
import { register } from '@/lib/api/auth';

const BACKEND_ROLES = [
  'SYSTEM_ADMIN',
  'HELPDESK_MANAGER',
  'HELPDESK_AGENT',
  'END_USER',
  'DEPARTMENT_MANAGER',
  'KNOWLEDGE_MANAGER',
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'END_USER', phone: '', location: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
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

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function promptToggleStatus(user) {
    setConfirmActionUser(user);
    setOpenMenuId(null);
  }

  async function executeToggleStatus() {
    if (!confirmActionUser) return;
    const user = confirmActionUser;
    setConfirmActionUser(null);
    
    // Optimistic update
    setUsers(users.map(u => u.id === user.id ? { ...u, active: !user.active } : u));
    
    try {
      if (user.active) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      // background refetch to confirm
      loadUsers();
    } catch (err) {
      setError(`Failed to ${user.active ? 'deactivate' : 'activate'} user: ` + (err.message || ''));
      // Revert optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, active: user.active } : u));
    }
  }

  function openEditMenu(user) {
    setEditingUser({ ...user });
    setOpenMenuId(null);
  }

  async function handleEditUser(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const previousUsers = [...users];
    // Optimistic update
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editingUser } : u));

    try {
      await updateUser(editingUser.id, {
        email: editingUser.email,
        phone: editingUser.phone,
        location: editingUser.location,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setFormError('Failed to update user: ' + (err.message || ''));
      setUsers(previousUsers); // Revert
    } finally {
      setFormLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await register(formData);
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', role: 'END_USER', phone: '', location: '' });
      await loadUsers();
    } catch (err) {
      setFormError('Failed to create user: ' + (err.message || ''));
    } finally {
      setFormLoading(false);
    }
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  }

  function updateEditField(field, value) {
    setEditingUser((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  }

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedUsers = users.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage accounts, role assignments (Admin, Agent, Manager, End User), and security policies.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Create User'}
        </Button>
      </div>

      {/* ── Create User Form ── */}
      {showForm && !editingUser && (
        <Card glass className="mb-6">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Fill in the details below to register a new user account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text" required minLength={3} maxLength={50}
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="e.g. john.doe"
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email" required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@insa.gov.et"
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password" required minLength={8}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 focus:outline-none"
                >
                  {BACKEND_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+251 ..."
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. Addis Ababa HQ"
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                {formError && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl mb-3">
                    <span>⚠️</span> {formError}
                  </div>
                )}
                <Button type="submit" variant="primary" size="sm" disabled={formLoading}>
                  {formLoading ? 'Creating…' : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Edit User Form ── */}
      {editingUser && (
        <Card glass className="mb-6 border-brand-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Edit User: {editingUser.username}</CardTitle>
              <CardDescription>Update profile details.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
              ✕ Close
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email" required
                  value={editingUser.email}
                  onChange={(e) => updateEditField('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => updateEditField('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingUser.location || ''}
                  onChange={(e) => updateEditField('location', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              
              <div className="md:col-span-2">
                {formError && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl mb-3">
                    <span>⚠️</span> {formError}
                  </div>
                )}
                <Button type="submit" variant="primary" size="sm" disabled={formLoading}>
                  {formLoading ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── User Table ── */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl mb-4">
          <span>⚠️</span> {error}
        </div>
      )}

      <Card glass>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>System Accounts</CardTitle>
            <CardDescription>
              {loading ? 'Loading…' : `Total ${users.length} registered users`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="p-3.5 pl-6">ID</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin mr-2" />
                      Loading users…
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, index) => {
                    const isNearBottom = paginatedUsers.length > 3 && index >= paginatedUsers.length - 2;
                    return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-6 font-mono font-bold text-slate-400">{u.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{u.username}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${
                          u.active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{u.email}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{u.phone || '—'}</td>
                      <td className="p-3.5 text-slate-600">{u.location || '—'}</td>
                      <td className="p-3.5 text-right pr-6 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          className="text-slate-600 hover:bg-slate-100 px-2 h-7"
                        >
                          <span className="text-lg leading-none">⋮</span>
                        </Button>
                        
                        {openMenuId === u.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className={`absolute right-6 z-50 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-left overflow-hidden shadow-black/5 animate-in fade-in zoom-in-95 duration-150 ease-out ${isNearBottom ? 'bottom-8 origin-bottom-right' : 'top-8 origin-top-right'}`}>
                              <button
                                onClick={() => openEditMenu(u)}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => promptToggleStatus(u)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition ${u.active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                              >
                                {u.active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="text-xs text-slate-500">
                Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to {Math.min(safeCurrentPage * itemsPerPage, users.length)} of {users.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <div className="text-xs font-medium text-slate-600 px-2">
                  Page {safeCurrentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Confirmation Modal ── */}
      {confirmActionUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl border-slate-200 animate-in zoom-in-95 duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Confirm {confirmActionUser.active ? 'Deactivation' : 'Activation'}</CardTitle>
              <CardDescription>
                Are you sure you want to {confirmActionUser.active ? 'deactivate' : 'activate'} the account for <strong>{confirmActionUser.username}</strong>?
                {confirmActionUser.active && " They will immediately lose access to the system."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmActionUser(null)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                className={confirmActionUser.active ? "bg-rose-600 hover:bg-rose-700 border-rose-600 text-white" : "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"}
                onClick={executeToggleStatus}
              >
                Yes, {confirmActionUser.active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
