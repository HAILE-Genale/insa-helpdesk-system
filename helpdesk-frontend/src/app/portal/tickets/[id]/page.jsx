'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';

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
    'The VPN connection to the headquarters server drops exactly after 10 minutes of idle time. This is affecting my ability to access internal financial systems. I have tried restarting the Cisco AnyConnect client and my machine but the issue persists. It happens on both WiFi and wired connections.',
  requester: { name: 'Bethlehem Tadesse', email: 'bethlehem.t@insa.gov.et', avatar: 'BT' },
  assignedAgent: { name: 'Abebe Bikila', email: 'abebe.b@insa.gov.et', avatar: 'AB' },
  slaDeadline: 'July 23, 2026 at 5:00 PM',
  slaRemaining: '2h 15m',
  slaBreached: false,
};

const timeline = [
  {
    id: 1,
    type: 'created',
    actor: 'Bethlehem Tadesse',
    message: 'Ticket submitted via Web Portal.',
    time: 'July 21, 2026 – 09:15 AM',
    icon: '🎫',
  },
  {
    id: 2,
    type: 'assigned',
    actor: 'System (Auto-Routing)',
    message: 'Ticket automatically assigned to Abebe Bikila (Network Operations).',
    time: 'July 21, 2026 – 09:16 AM',
    icon: '🤖',
  },
  {
    id: 3,
    type: 'comment',
    actor: 'Abebe Bikila',
    message:
      'Hello Bethlehem, I have reviewed your ticket. I will investigate the VPN timeout configuration on the server side. Please try the updated Cisco AnyConnect profile I have pushed to your machine.',
    time: 'July 21, 2026 – 10:30 AM',
    icon: '💬',
    isAgent: true,
  },
  {
    id: 4,
    type: 'status',
    actor: 'Abebe Bikila',
    message: 'Status changed from OPEN → IN PROGRESS.',
    time: 'July 21, 2026 – 10:31 AM',
    icon: '🔄',
  },
  {
    id: 5,
    type: 'comment',
    actor: 'Bethlehem Tadesse',
    message:
      'I applied the new AnyConnect profile. The connection is more stable now but still dropped once after about 15 minutes. Will continue monitoring.',
    time: 'July 22, 2026 – 02:10 PM',
    icon: '💬',
  },
];

const priorityConfig = {
  CRITICAL: { variant: 'urgent', label: 'Critical' },
  HIGH: { variant: 'urgent', label: 'High' },
  MEDIUM: { variant: 'progress', label: 'Medium' },
  LOW: { variant: 'default', label: 'Low' },
};

const statusConfig = {
  OPEN: { variant: 'open', label: 'Open' },
  IN_PROGRESS: { variant: 'progress', label: 'In Progress' },
  RESOLVED: { variant: 'resolved', label: 'Resolved' },
  CLOSED: { variant: 'default', label: 'Closed' },
};

export default function TicketDetailPage({ params }) {
  const [comment, setComment] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentSubmitted(true);
    setComment('');
    setTimeout(() => setCommentSubmitted(false), 3000);
  };

  const pConf = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
  const sConf = statusConfig[ticket.status] || statusConfig.OPEN;

  return (
    <>
          {/* Back + Header */}
          <div className="mb-6">
            <Link href="/portal/my-tickets" className="text-xs text-brand-600 hover:underline font-semibold mb-3 inline-flex items-center gap-1">
              ← Back to My Tickets
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-slate-400">{ticket.id}</span>
                  <Badge variant={sConf.variant}>{sConf.label}</Badge>
                  <Badge variant={pConf.variant} pulse={ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'}>
                    {pConf.label} Priority
                  </Badge>
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug max-w-2xl">{ticket.title}</h1>
                <p className="text-xs text-slate-500 mt-1">Submitted {ticket.createdAt} · Last updated {ticket.updatedAt}</p>
              </div>
              {ticket.status === 'RESOLVED' && (
                <Button variant="outline" size="sm">↩ Reopen Ticket</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-sm">Issue Description</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>

                  {ticket.errorMessage && (
                    <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-rose-700 mb-0.5">Error Message Reported</p>
                      <code className="text-xs text-rose-900 font-mono">{ticket.errorMessage}</code>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-sm">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="relative space-y-6">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />

                    {timeline.map((event) => (
                      <div key={event.id} className="relative flex gap-4 pl-1">
                        <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-sm flex-shrink-0">
                          {event.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-800">{event.actor}</span>
                            {event.isAgent && (
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md border border-brand-200">
                                Agent
                              </span>
                            )}
                          </div>
                          {event.type === 'comment' ? (
                            <div className={`rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed ${
                              event.isAgent ? 'bg-brand-50/60 border border-brand-100' : 'bg-slate-50 border border-slate-200'
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

              {/* Add Comment */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-sm">Add a Comment / Update</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {commentSubmitted ? (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-2">✓</div>
                      <p className="text-sm font-semibold text-emerald-700">Comment submitted!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddComment} className="space-y-3">
                      <Textarea
                        placeholder="Add a reply, provide an update, or request more information..."
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button variant="primary" size="sm" type="submit">
                          Submit Comment →
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-4">
              {/* Ticket Details */}
              <Card glass>
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Details</h3>
                  {[
                    { label: 'Category', value: ticket.category },
                    { label: 'Sub-Category', value: ticket.subCategory },
                    { label: 'Department', value: ticket.department },
                    { label: 'Location', value: ticket.location },
                    { label: 'Phone', value: ticket.phone },
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

              {/* SLA */}
              <Card className={`${ticket.slaBreached ? 'border-rose-300 bg-rose-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
                <CardContent className="p-5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">SLA Status</h3>
                  <div className="text-2xl font-bold font-mono text-amber-600">{ticket.slaRemaining}</div>
                  <p className="text-[10px] text-slate-500 mt-1">Deadline: {ticket.slaDeadline}</p>
                  <div className="mt-3 bg-amber-200/50 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '35%' }} />
                  </div>
                </CardContent>
              </Card>

              {/* People */}
              <Card glass>
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">People</h3>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Requester</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                        {ticket.requester.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{ticket.requester.name}</div>
                        <div className="text-[10px] text-slate-500">{ticket.requester.email}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Agent</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        {ticket.assignedAgent.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{ticket.assignedAgent.name}</div>
                        <div className="text-[10px] text-slate-500">{ticket.assignedAgent.email}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
    </>
  );
}
