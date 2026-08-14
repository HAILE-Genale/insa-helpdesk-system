'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { TicketAttachments } from '@/components/tickets/TicketAttachments';
import { getTicket, getComments, addComment, getTicketAttachments } from '@/lib/api/tickets';
import { getTicketFeedback, submitFeedback } from '@/lib/api/feedback';
import { useAuth } from '@/lib/AuthContext';

const PRIORITY_VARIANT = { CRITICAL: 'urgent', HIGH: 'urgent', MEDIUM: 'progress', LOW: 'default' };
const STATUS_VARIANT   = { OPEN: 'open', IN_PROGRESS: 'progress', RESOLVED: 'resolved', CLOSED: 'default', ON_HOLD: 'default' };

const TERMINAL_STATUSES = ['RESOLVED', 'CLOSED'];

function formatDate(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function StarRating({ rating, setRating, disabled = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setRating(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          className={`text-3xl transition ${
            star <= (hover || rating)
              ? 'text-amber-400'
              : 'text-slate-300'
          } ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

export default function PortalTicketDetailPage({ params }) {
  const { id } = params;
  const { user } = useAuth();

  const [ticket, setTicket]               = useState(null);
  const [comments, setComments]           = useState([]);
  const [attachments, setAttachments]     = useState([]);
  const [feedback, setFeedback]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  // Comment form
  const [comment, setComment]             = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError]   = useState('');

  // Feedback form
  const [rating, setRating]               = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getTicket(id),
      getComments(id),
      getTicketAttachments(id).catch(() => ({ data: [] })),
      getTicketFeedback(id).catch(() => ({ data: [] })),
    ])
      .then(([ticketRes, commentsRes, attachmentsRes, feedbackRes]) => {
        if (cancelled) return;
        const t = ticketRes?.data ?? ticketRes;
        setTicket(t);
        setComments((commentsRes?.data ?? commentsRes ?? []).filter((c) => !c.internal));
        setAttachments(attachmentsRes?.data ?? attachmentsRes ?? []);
        const fbList = feedbackRes?.data ?? feedbackRes ?? [];
        setFeedback(Array.isArray(fbList) && fbList.length > 0 ? fbList[0] : null);
      })
      .catch((err) => {
        if (!cancelled) setError('Failed to load ticket. ' + (err.message || ''));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    setCommentError('');
    try {
      const newComment = await addComment(id, comment, false);
      const c = newComment?.data ?? newComment;
      setComments((prev) => [...prev, c]);
      setComment('');
    } catch (err) {
      setCommentError(err.message || 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmittingFeedback(true);
    setFeedbackError('');
    try {
      const res = await submitFeedback(id, rating, feedbackComment);
      const created = res?.data ?? res;
      setFeedback(created);
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

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
        <Link href="/portal/my-tickets">
          <Button variant="outline" size="sm" className="mt-4">← Back to My Tickets</Button>
        </Link>
      </div>
    );
  }

  const pConf = PRIORITY_VARIANT[ticket.priority] || 'default';
  const sConf = STATUS_VARIANT[ticket.status] || 'default';
  const canComment = !TERMINAL_STATUSES.includes(ticket.status);
  const canGiveFeedback = TERMINAL_STATUSES.includes(ticket.status) && !feedback;
  const hasGivenFeedback = feedback !== null;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/portal/my-tickets" className="text-xs text-brand-600 hover:underline font-semibold mb-3 inline-flex items-center gap-1">
          ← Back to My Tickets
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm font-bold text-slate-400">
                {ticket.ticketNumber || `#${ticket.id}`}
              </span>
              <Badge variant={sConf}>{ticket.status?.replace('_', ' ')}</Badge>
              <Badge variant={pConf} pulse={ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'}>
                {ticket.priority} Priority
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug max-w-2xl">{ticket.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitted {formatDate(ticket.createdAt)} · Last updated {formatDate(ticket.updatedAt)}
            </p>
          </div>
        </div>
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
                  <p className="text-xs font-bold text-rose-700 mb-0.5">Error Message Reported</p>
                  <code className="text-xs text-rose-900 font-mono">{ticket.errorMessage}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Section — shown when ticket is RESOLVED/CLOSED and no feedback yet */}
          <Card glass>
            <CardHeader><CardTitle className="text-sm">Attachments</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6">
              {attachments.length > 0 ? (
                <TicketAttachments attachments={attachments} />
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No attachments uploaded.</p>
              )}
            </CardContent>
          </Card>

          {canGiveFeedback && (
            <Card glass>
              <CardHeader><CardTitle className="text-sm">Rate Your Support Experience</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-xs text-slate-500 mb-3">
                  This ticket has been resolved. Please rate the support you received from {ticket.assigneeName || 'the agent'}.
                  Your feedback is also sent to the agent and their team manager.
                </p>
                {feedbackSuccess ? (
                  <p className="text-sm text-emerald-600 font-semibold">&#10003; Feedback submitted successfully. Thank you!</p>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    {feedbackError && (
                      <p className="text-xs text-rose-600">{feedbackError}</p>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Your Rating *</label>
                      <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <Textarea
                      label="Comments (optional)"
                      placeholder="Tell us about your experience..."
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" type="submit" disabled={submittingFeedback || rating === 0}>
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback &rarr;'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show existing feedback */}
          {hasGivenFeedback && (
            <Card glass>
              <CardHeader><CardTitle className="text-sm">Your Feedback</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl text-amber-400">
                    {'\u2605'.repeat(feedback.rating)}
                    <span className="text-slate-300">{'\u2605'.repeat(5 - feedback.rating)}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {feedback.rating} of 5 stars
                  </span>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-slate-700 mt-2 italic">"{feedback.comment}"</p>
                )}
                <p className="text-[10px] text-slate-400 mt-2">
                  Submitted {formatDate(feedback.createdAt)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card glass>
            <CardHeader><CardTitle className="text-sm">Activity Timeline</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No comments yet.</p>
              ) : (
                <div className="relative space-y-6">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                  {comments.map((event) => (
                    <div key={event.id} className="relative flex gap-4 pl-1">
                      <div className="relative z-10 w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {initials(event.authorName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800">{event.authorName}</span>
                        </div>
                        <div className="rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200">
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

          {/* Reply Form (only for non-terminal tickets) */}
          {canComment && (
            <Card glass>
              <CardHeader><CardTitle className="text-sm">Add a Comment / Update</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                {commentError && (
                  <p className="text-xs text-rose-600 mb-2">{commentError}</p>
                )}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <Textarea
                    placeholder="Add a reply, provide an update, or request more information..."
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" type="submit" disabled={submittingComment}>
                      {submittingComment ? 'Submitting...' : 'Submit Comment &rarr;'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticket Details */}
          <Card glass>
            <CardContent className="p-5 space-y-4">
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

          {/* People */}
          <Card glass>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">People</h3>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Requester</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {initials(ticket.reporterName)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{ticket.reporterName || '\u2014'}</div>
                    <div className="text-[10px] text-slate-500">{ticket.reporterEmail || '\u2014'}</div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-witer mb-2">Assigned Agent</p>
                {ticket.assigneeName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                      {initials(ticket.assigneeName)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{ticket.assigneeName}</div>
                      <div className="text-[10px] text-slate-500">{ticket.assigneeEmail || '\u2014'}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Unassigned</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
