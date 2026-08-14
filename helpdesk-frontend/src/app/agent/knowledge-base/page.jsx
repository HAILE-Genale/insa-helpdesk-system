'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getArticles, createArticle, updateArticle, deleteArticle } from '@/lib/api/knowledgeBase';
import { getCategories } from '@/lib/api/categories';

const STATUS_COLORS = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT:     'bg-amber-50 text-amber-700 border-amber-200',
};

const DEPARTMENTS = [
  'IT & Infrastructure', 'Network Operations', 'Human Resources',
  'Finance & Procurement', 'Cyber Operations', 'Legal & Policy', 'General',
];

const EMPTY_FORM = {
  title: '', problem: '', cause: '', solution: '',
  category: '', department: '', tags: '', status: 'DRAFT',
};

function ArticleForm({ initial, categories, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 glass-input text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition';
  const textCls  = `${inputCls} resize-y`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
          <input type="text" required value={form.title} onChange={set('title')}
            placeholder="e.g. How to reset your AD password" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
          <select value={form.category} onChange={set('category')} className={inputCls}>
            <option value="">— Select category —</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
          <select value={form.department} onChange={set('department')} className={inputCls}>
            <option value="">— All departments —</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          🔴 Problem <span className="text-slate-400 font-normal">(what the user experiences)</span>
        </label>
        <textarea rows={2} required value={form.problem} onChange={set('problem')}
          placeholder="e.g. User cannot log in to the ERP system after password change."
          className={textCls} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          🟡 Cause <span className="text-slate-400 font-normal">(why it happens)</span>
        </label>
        <textarea rows={2} value={form.cause} onChange={set('cause')}
          placeholder="e.g. ERP sessions are cached and don't automatically pick up AD password changes."
          className={textCls} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ✅ Solution <span className="text-slate-400 font-normal">(step-by-step fix)</span> *
        </label>
        <textarea rows={5} required value={form.solution} onChange={set('solution')}
          placeholder={"1. Clear browser cache (Ctrl+Shift+Delete).\n2. Log out of ERP and close all browser windows.\n3. Re-open the browser and log in with the new password.\n4. If still failing, contact IT helpdesk."}
          className={textCls} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
          <input type="text" value={form.tags} onChange={set('tags')}
            placeholder="e.g. ERP, password, login" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
          <select value={form.status} onChange={set('status')} className={inputCls}>
            <option value="DRAFT">Draft (visible to agents only)</option>
            <option value="PUBLISHED">Published (visible to all users)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" disabled={saving || !form.title || !form.problem || !form.solution}
          onClick={() => onSave(form)}>
          {saving ? 'Saving…' : form.status === 'PUBLISHED' ? '🌐 Publish Article' : '💾 Save Draft'}
        </Button>
      </div>
    </div>
  );
}

export default function AgentKnowledgeBasePage() {
  const [articles,   setArticles]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [mode,       setMode]       = useState('list'); // 'list' | 'create' | 'edit'
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    Promise.all([
      // Agents can view all articles (DRAFT+PUBLISHED) via GET /knowledge-base.
      // getMyArticles requires KB_AUTHOR which agents don't have, so use getArticles.
      getArticles().then((r) => setArticles(r?.data ?? r ?? [])),
      getCategories().then((r) => setCategories((r ?? []).filter((c) => c.active))),
    ])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    getArticles()
      .then((r) => setArticles(r?.data ?? r ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleSave = async (form) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateArticle(editing.id, form);
        setSuccessMsg('Article updated.');
      } else {
        await createArticle(form);
        setSuccessMsg('Article ' + (form.status === 'PUBLISHED' ? 'published' : 'saved as draft') + '.');
      }
      setMode('list');
      setEditing(null);
      refresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setError(e.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Write, edit, and publish solution articles for end users.
          </p>
        </div>
        {mode === 'list' && (
          <Button variant="primary" size="sm" onClick={() => { setEditing(null); setMode('create'); }}>
            + New Article
          </Button>
        )}
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Create / Edit Form */}
      {(mode === 'create' || mode === 'edit') && (
        <Card glass className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">{editing ? `Edit: ${editing.title}` : 'New Knowledge Article'}</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ArticleForm
              initial={editing ? {
                title: editing.title, problem: editing.problem, cause: editing.cause || '',
                solution: editing.solution, category: editing.category || '',
                department: editing.department || '', tags: editing.tags || '',
                status: editing.status,
              } : EMPTY_FORM}
              categories={categories}
              onSave={handleSave}
              onCancel={() => { setMode('list'); setEditing(null); }}
              saving={saving}
            />
          </CardContent>
        </Card>
      )}

      {/* Article List */}
      {mode === 'list' && (
        <>
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <Card className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-sm font-semibold text-slate-700">No articles yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Share your knowledge — write your first article.</p>
              <Button variant="primary" size="sm" onClick={() => setMode('create')}>
                + Write First Article
              </Button>
            </Card>
          )}

          {!loading && articles.length > 0 && (
            <div className="space-y-4">
              {articles.map((a) => (
                <Card key={a.id} glass className="hover:border-brand-300 transition">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_COLORS[a.status] || STATUS_COLORS.DRAFT}`}>
                            {a.status}
                          </span>
                          {a.category && (
                            <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                              {a.category}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">👁️ {a.views} views</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.problem}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {a.department && <span className="mr-2">{a.department}</span>}
                          Updated {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(a); setMode('edit'); }}>
                          Edit
                        </Button>
                        {a.status === 'DRAFT' && (
                          <Button variant="primary" size="sm"
                            onClick={() => handleSave({ ...a, status: 'PUBLISHED' })}>
                            Publish
                          </Button>
                        )}
                        <button onClick={() => handleDelete(a.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2">
                          Delete
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
