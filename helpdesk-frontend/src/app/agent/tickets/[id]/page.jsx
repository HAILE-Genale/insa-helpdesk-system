'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { getTicket, getComments, addComment, updateTicketStatus, assignTicket } from '@/lib/api/tickets';
import { getUsers } from '@/lib/api/users';

const STATUSES = [
  { value: 'OPEN',        label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD',     label: 'On Hold' },
  { value: 'RESOLVED',    label: 'Resolved' },
  { value: 'CLOSED',      label: 'Closed' },
];

const STATUS_COLORS = {
  OPEN:        'border-blue-300 text-blue-700 bg-blue-50',
  IN_PROGRESS: 'border-amber-300 text-amber-700 bg-amber-50',
  ON_HOLD:     'border-slate-300 text-slate-700 bg-slate-50',
  RESOLVED:    'border-emerald-300 text-emerald-700 bg-emerald-50',
  CLOSED:      'border-slate-400 text-slate-600 bg-slate-100',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function AgentTicketDetailPage({ params }) {
  const { id } = params;

  const [ticket, setTicket]                 = useState(null);
  const [comments, setComments]             = useState([]);
  const [agents, setAgents]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  // Status / assign controls
  const [status, setStatus]                 = useState('');
  const [savingStatus, setSavingStatus]     = useState(false);
  const [statusMsg, setStatusMsg]           = useState('');
  const [selectedAgent, setSelectedAgent]   = useState('');
  const [savingAssign, setSavingAssign]     = useState(false);
  const [assignMsg, setAssignMsg]           = useState('');

  // Comment controls
  const [noteText, setNoteText]             = useState('');
  const [noteType, setNoteType]             = useState('comment');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError]           = useState('');

  useEffect(() => {
    Promise.all([getTicket(id), getComments(id), getUsers()])
      .then(([ticketRes, commentsRes, usersRes]) => {
        const t = ticketRes?.data ?? ticketRes;
        setTicket(t);
        setStatus(t?.status || 'OPEN');
        setSelectedAgent(String(t?.assigneeId || ''));
        setComments(commentsRes?.data ?? commentsRes ?? []);
        setAgents((usersRes?.data ?? usersRes ?? []).filter((u) => u.active !== false));
      })
      .catch((err) => setError('Failed to load ticket. ' + (err.message || '')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    setStatusMsg('');
    try {
      const res = await updateTicketStatus(id, status);
      const updated = res?.data ?? res;
      setTicket(updated);
      setStatusMsg('Status saved.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg('Error: ' + (err.message || 'Failed to save'));
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveAssign = async () => {
    if (!selectedAgent) return;
    setSavingAssign(true);
    setAssignMsg('');
    try {
      const res = await assignTicket(id, Number(selectedAgent));
      const updated = res?.data ?? res;
      setTicket(updated);
      setAssignMsg('Assignment saved.');
      setTimeout(() => setAssignMsg(''), 3000);
    } catch (err) {
      setAssignMsg('Error: ' + (err.message || 'Failed to assign'));
    } finally {
      setSavingAssign(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmittingNote(true);
    setNoteError('');
    try {
      const isInternal = noteType === 'internal_note';
      const res = await addComment(id, noteText, isInternal);
      const newComment = res?.data ?? res;
      setComments((prev) => [...prev, newComment]);
      setNoteText('');
    } catch (err) {
      setNoteError(err.message || 'Failed to submit.');
    } finally {
      setSubmittingNote(false);
    }
  };

  // ---- Render ----

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-xl w-1/3" />
        <div className="h-48 bg-slate-100 rounded-2xl" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-600 font-semibold">{error || 'Ticket not found.'}</p>
        <Link href="/agent/tickets">
          <Button variant="outline" size="sm" className="mt-4">← Back to Queue</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/agent/tickets" className="text-xs text-brand-600 hover:underline font-semibold mb-3 inline-flex items-center gap-1">
          ← Back to Queue
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm font-bold text-slate-400">
                {ticket.ticketNumber || `#${ticket.id}`}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_COLORS[status] || STATUS_COLORS.OPEN}`}>
                {STATUSES.find((s) => s.value === status)?.label || status}
              </span>
              {(ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL') && (
                <Badge variant="urgent" pulse>{ticket.priority} Priority</Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug max-w-2xl">{ticket.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitted {formatDate(ticket.createdAt)} · Updated {formatDate(ticket.updatedAt)}
            </p>
          </div>

          {/* Quick Status Change */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-brand-400 transition"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <Button variant="primary" size="sm" onClick={handleSaveStatus} disabled={savingStatus}>
              {savingStatus ? 'Saving...' : 'Save Status'}
            </Button>
          </div>
        </div>
        {statusMsg && (
          <p className={`text-xs mt-2 font-semibold ${statusMsg.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
            {statusMsg}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card glass>
            <CardHeader><CardTitle className="text-sm">Issue Description</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              {ticket.errorMessage && (
                <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-rose-700 mb-0.5">Error Message</p>
                  <code className="text-xs text-rose-900 font-mono">{ticket.errorMessage}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card glass>
            <CardHeader><CardTitle className="text-sm">Activity Log & Timeline</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No activity yet.</p>
              ) : (
                <div className="relative space-y-6">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                  {comments.map((event) => (
                    <div key={event.id} className="relative flex gap-4 pl-1">
                      <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0 text-slate-600">
                        {initials(event.authorName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800">{event.authorName}</span>
                          {event.internal && (
                            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-200">
                              🔒 Internal Note
                            </span>
                          )}
                        </div>
                        <div className={`rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed ${
                          event.internal
                            ? 'bg-violet-50 border border-violet-100'
                            : 'bg-slate-50 border border-slate-200'
                        }`}>
                          {event.content}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">{formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply / Note Form */}
          <Card glass>
            <CardHeader><CardTitle className="text-sm">Reply or Add Internal Note</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6">
              {noteError && <p className="text-xs text-rose-600 mb-2">{noteError}</p>}
              <form onSubmit={handleNoteSubmit} className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  {['comment', 'internal_note'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNoteType(t)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                        noteType === t
                          ? t === 'internal_note'
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'comment' ? '💬 Reply to User' : '🔒 Internal Note'}
                    </button>
                  ))}
                  {noteType === 'internal_note' && (
                    <span className="text-[10px] text-violet-600 font-semibold">Visible to agents only</span>
                  )}
                </div>
                <Textarea
                  placeholder={noteType === 'internal_note' ? 'Write an internal note (not visible to user)...' : 'Write a reply to the user...'}
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" type="submit" disabled={submittingNote}>
                    {submittingNote ? 'Saving...' : noteType === 'internal_note' ? '🔒 Save Note →' : '💬 Send Reply →'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Assignment */}
          <Card glass>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignment</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-brand-400 transition"
                >
                  <option value="">— Unassigned —</option>
                  {agents.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.username} {a.email ? `(${a.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {assignMsg && (
                <p className={`text-xs font-semibold ${assignMsg.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {assignMsg}
                </p>
              )}
              <Button variant="primary" size="sm" className="w-full" onClick={handleSaveAssign} disabled={savingAssign || !selectedAgent}>
                {savingAssign ? 'Saving...' : 'Save Assignment'}
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card glass>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Details</h3>
              {[
                { label: 'Category',      value: ticket.category },
                { label: 'Department',    value: ticket.department },
                { label: 'Location',      value: ticket.location },
                { label: 'Phone',         value: ticket.phone },
                { label: 'Asset Tag',     value: ticket.assetTag },
                { label: 'Issue Started', value: ticket.issueStartDate },
                { label: 'Priority',      value: ticket.priority },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                  <span className="text-xs font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Requester */}
          <Card glass>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requester</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center">
                  {initials(ticket.reporterName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{ticket.reporterName || '—'}</div>
                  <div className="text-[10px] text-slate-500">{ticket.reporterEmail || '—'}</div>
                  {ticket.phone && <div className="text-[10px] text-slate-500">{ticket.phone}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
