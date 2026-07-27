'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, Textarea } from '@/components/ui/input';

const ticket = {
  id: 'TK-8941',
  title: 'VPN Connection drops after 10 minutes of idle',
  category: 'Network & VPN',
  subCategory: 'VPN',
  priority: 'HIGH',
  status: 'IN_PROGRESS',
  department: 'Finance & Procurement',
  location: 'Building B, Room 204',
  phone: '+251 91 234 5678',
  assetTag: 'INSA-LT-047',
  errorMessage: 'VPN Error: 812 – Connection timeout',
  issueStarted: '2026-07-21',
  createdAt: 'July 21, 2026 at 09:15 AM',
  updatedAt: '12 minutes ago',
  description:
    'The VPN connection to the headquarters server drops exactly after 10 minutes of idle time. This is affecting my ability to access internal financial systems. I have tried restarting the Cisco AnyConnect client and my machine but the issue persists.',
  requester: { name: 'Bethlehem Tadesse', email: 'bethlehem.t@insa.gov.et', avatar: 'BT' },
  assignedAgent: { name: 'Abebe Bikila', email: 'abebe.b@insa.gov.et', avatar: 'AB' },
  slaDeadline: 'July 23, 2026 at 5:00 PM',
  slaRemaining: '2h 15m',
  slaBreached: false,
};

const timeline = [
  { id: 1, type: 'created', actor: 'Bethlehem Tadesse', message: 'Ticket submitted via Web Portal.', time: 'July 21, 2026 – 09:15 AM', icon: '🎫' },
  { id: 2, type: 'assigned', actor: 'System (Auto-Routing)', message: 'Assigned to Abebe Bikila (Network Operations).', time: 'July 21, 2026 – 09:16 AM', icon: '🤖' },
  { id: 3, type: 'comment', actor: 'Abebe Bikila', message: 'Investigating VPN timeout config on server side. Pushed updated AnyConnect profile to your machine.', time: 'July 21, 2026 – 10:30 AM', icon: '💬', isInternal: false },
  { id: 4, type: 'status', actor: 'Abebe Bikila', message: 'Status changed: OPEN → IN PROGRESS', time: 'July 21, 2026 – 10:31 AM', icon: '🔄' },
  { id: 5, type: 'note', actor: 'Abebe Bikila', message: '[INTERNAL NOTE] Checked VPN logs — idle-timeout set to 600s. Will escalate to NOC to update group policy.', time: 'July 22, 2026 – 09:00 AM', icon: '🔒', isInternal: true },
  { id: 6, type: 'comment', actor: 'Bethlehem Tadesse', message: 'Applied the new profile. Still dropped once after ~15 min. Monitoring now.', time: 'July 22, 2026 – 02:10 PM', icon: '💬' },
];

const agents = [
  { value: 'abebe', label: 'Abebe Bikila – Network Ops' },
  { value: 'tigist', label: 'Tigist Alemu – Tier-1' },
  { value: 'dawit', label: 'Dawit Isaac – Tier-2' },
  { value: 'unassigned', label: 'Unassigned' },
];

const statuses = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function AgentTicketDetailPage({ params }) {
  const [status, setStatus] = useState(ticket.status);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('comment');
  const [noteSubmitted, setNoteSubmitted] = useState(false);

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSubmitted(true);
    setNoteText('');
    setTimeout(() => setNoteSubmitted(false), 3000);
  };

  const statusColors = {
    OPEN: 'border-brand-300 text-brand-700 bg-brand-50',
    IN_PROGRESS: 'border-amber-300 text-amber-700 bg-amber-50',
    ON_HOLD: 'border-slate-300 text-slate-700 bg-slate-50',
    RESOLVED: 'border-emerald-300 text-emerald-700 bg-emerald-50',
    CLOSED: 'border-slate-400 text-slate-600 bg-slate-100',
  };

  return (
    <>
          {/* Header */}
          <div className="mb-6">
            <Link href="/agent/tickets" className="text-xs text-brand-600 hover:underline font-semibold mb-3 inline-flex items-center gap-1">
              ← Back to Queue
            </Link>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-slate-400">{ticket.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColors[status]}`}>
                    {statuses.find(s => s.value === status)?.label || status}
                  </span>
                  <Badge variant="urgent" pulse>High Priority</Badge>
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug max-w-2xl">{ticket.title}</h1>
                <p className="text-xs text-slate-500 mt-1">Submitted {ticket.createdAt} · Updated {ticket.updatedAt}</p>
              </div>

              {/* Quick Status Change */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-brand-400 transition"
                >
                  {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <Button variant="primary" size="sm">Save Status</Button>
              </div>
            </div>
          </div>

          {/* SLA Alert Banner */}
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-2xl px-5 py-3">
            <span className="text-amber-600 text-lg">⏱️</span>
            <div>
              <p className="text-xs font-bold text-amber-800">SLA Deadline in {ticket.slaRemaining}</p>
              <p className="text-[10px] text-amber-700">Resolve before {ticket.slaDeadline} to stay within policy.</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <Button variant="outline" size="sm">Escalate →</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card glass>
                <CardHeader><CardTitle className="text-sm">Issue Description</CardTitle></CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
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
                  <div className="relative space-y-6">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                    {timeline.map((event) => (
                      <div key={event.id} className="relative flex gap-4 pl-1">
                        <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-sm flex-shrink-0">
                          {event.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-800">{event.actor}</span>
                            {event.isInternal && (
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-200">
                                🔒 Internal Note
                              </span>
                            )}
                          </div>
                          {event.type === 'comment' || event.type === 'note' ? (
                            <div className={`rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed ${
                              event.isInternal
                                ? 'bg-violet-50 border border-violet-100'
                                : 'bg-slate-50 border border-slate-200'
                            }`}>
                              {event.message}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600">{event.message}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1.5">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reply / Note Form */}
              <Card glass>
                <CardHeader><CardTitle className="text-sm">Reply or Add Internal Note</CardTitle></CardHeader>
                <CardContent className="px-6 pb-6">
                  {noteSubmitted ? (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-2">✓</div>
                      <p className="text-sm font-semibold text-emerald-700">Response recorded in ticket history.</p>
                    </div>
                  ) : (
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
                          <span className="text-[10px] text-violet-600 font-semibold">
                            Visible to agents only
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder={noteType === 'internal_note' ? 'Write an internal note (not visible to user)...' : 'Write a reply to the user...'}
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="primary" size="sm" type="submit">
                          {noteType === 'internal_note' ? '🔒 Save Note' : '💬 Send Reply'} →
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Assignment */}
              <Card glass>
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignment</h3>
                  <Select
                    label="Assigned Agent"
                    options={agents}
                    defaultValue="abebe"
                  />
                  <Select
                    label="Support Team"
                    options={[
                      { value: 'noc', label: 'Network Operations (NOC)' },
                      { value: 'tier1', label: 'Tier-1 Helpdesk' },
                      { value: 'tier2', label: 'Tier-2 Technical Support' },
                      { value: 'iam', label: 'IAM & Directory' },
                    ]}
                    defaultValue="noc"
                  />
                  <Button variant="primary" size="sm" className="w-full">Save Assignment</Button>
                </CardContent>
              </Card>

              {/* Ticket Details */}
              <Card glass>
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Details</h3>
                  {[
                    { label: 'Category', value: ticket.category },
                    { label: 'Sub-Category', value: ticket.subCategory },
                    { label: 'Department', value: ticket.department },
                    { label: 'Location', value: ticket.location },
                    { label: 'Asset Tag', value: ticket.assetTag },
                    { label: 'Issue Started', value: ticket.issueStarted },
                  ].map(({ label, value }) => (
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
                      {ticket.requester.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{ticket.requester.name}</div>
                      <div className="text-[10px] text-slate-500">{ticket.requester.email}</div>
                      <div className="text-[10px] text-slate-500">{ticket.phone}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">View User Profile →</Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card glass>
                <CardContent className="p-5 space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                  <Button variant="outline" size="sm" className="w-full justify-start">📧 Notify User</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">🔗 Link Related Ticket</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">📋 Copy Ticket Link</Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-rose-600 hover:bg-rose-50">
                    ⚠️ Escalate to Manager
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
    </>
  );
}
