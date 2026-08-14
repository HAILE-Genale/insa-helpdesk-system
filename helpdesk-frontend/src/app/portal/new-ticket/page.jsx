'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Input, Select, Textarea } from '@/components/ui/input'
import { getTeamsPublic } from '@/lib/api/teams'
import { createTicket, uploadTicketAttachment } from '@/lib/api/tickets'
import { useAuth } from '@/lib/AuthContext'

const DEPARTMENTS = [
  { value: 'IT & Infrastructure', label: 'IT & Infrastructure' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Finance & Procurement', label: 'Finance & Procurement' },
  { value: 'Cyber Operations', label: 'Cyber Operations' },
  { value: 'Legal & Policy', label: 'Legal & Policy' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' },
]

export default function NewTicketPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdTicket, setCreatedTicket] = useState(null)
  const [error, setError] = useState('')
  const [attachmentWarning, setAttachmentWarning] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)

  // Teams loaded from the backend — these are the service providers
  const [teams, setTeams] = useState([])
  const [teamsLoading, setTeamsLoading] = useState(true)

  const [form, setForm] = useState({
    department: '',
    location: '',
    phone: '',
    assetTag: '',
    title: '',
    teamName: '',      // selected team name — sent as `category` to the backend for auto-routing
    errorMessage: '',
    issueStartDate: '',
    description: '',
  })

  useEffect(() => {
    getTeamsPublic()
      .then((res) => {
        // ApiResponse wraps data in res.data
        const list = res?.data ?? res ?? []
        setTeams(list)
      })
      .catch(() => setTeams([]))
      .finally(() => setTeamsLoading(false))
  }, [])

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const addFiles = (fileList) => {
    const nextFiles = Array.from(fileList || [])
    setAttachments((current) => {
      const merged = [...current]
      nextFiles.forEach((file) => {
        const duplicate = merged.some((item) => (
          item.name === file.name && item.size === file.size && item.lastModified === file.lastModified
        ))
        if (!duplicate) merged.push(file)
      })
      return merged.slice(0, 5)
    })
  }

  const removeAttachment = (index) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAttachmentWarning('')
    setSubmitting(true)

    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority,
        // team name is used as the category — the backend AssignmentService
        // matches this against routing rules to auto-assign to the right team
        category: form.teamName,
        department: form.department,
        location: form.location,
        phone: form.phone,
        assetTag: form.assetTag || null,
        errorMessage: form.errorMessage || null,
        issueStartDate: form.issueStartDate || null,
      }

      const response = await createTicket(payload)
      const ticket = response?.data ?? response
      if (attachments.length > 0) {
        const results = await Promise.allSettled(
          attachments.map((file) => uploadTicketAttachment(ticket.id, file))
        )
        const failed = results.filter((result) => result.status === 'rejected')
        if (failed.length > 0) {
          setAttachmentWarning(`${failed.length} attachment${failed.length > 1 ? 's' : ''} could not be uploaded. The ticket was still created.`)
        }
      }
      setCreatedTicket(ticket)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && createdTicket) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="text-center p-8 bg-emerald-50/50 border-emerald-200 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ticket Submitted Successfully!</h2>
          <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
            Your ticket reference is{' '}
            <span className="font-mono font-bold text-slate-800">
              {createdTicket.ticketNumber || `#${createdTicket.id}`}
            </span>
            . Your request has been routed to the <strong>{form.teamName}</strong> team.
          </p>
          {attachmentWarning && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-4">
              {attachmentWarning}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="primary" onClick={() => router.push('/portal/my-tickets')}>
              View My Tickets
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setCreatedTicket(null)
                setForm({
                  department: '', location: '', phone: '', assetTag: '',
                  title: '', teamName: '', errorMessage: '', issueStartDate: '', description: '',
                })
                setAttachments([])
                setAttachmentWarning('')
                setPriority('MEDIUM')
              }}
            >
              Create Another
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Support Ticket</h1>
          <p className="text-xs text-slate-500 mt-1">
            Select a service provider team and we'll route your request directly to them.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/portal/my-tickets')}>
          Cancel & Return
        </Button>
      </div>

      <Card glass>
        <CardContent className="p-6 md:p-8">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User & Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Department / Directorate"
                value={form.department}
                onChange={set('department')}
                required
                options={[{ value: '', label: 'Select department' }, ...DEPARTMENTS]}
              />
              <Input
                label="Office Location / Room Number"
                placeholder="e.g. Building A, Room 302"
                value={form.location}
                onChange={set('location')}
              />
              <Input
                label="Contact Phone Number"
                placeholder="+251 9..."
                value={form.phone}
                onChange={set('phone')}
              />
              <Input
                label="Device Asset Tag (Optional)"
                placeholder="e.g. INSA-LT-001"
                value={form.assetTag}
                onChange={set('assetTag')}
              />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <Input
                label="Ticket Title / Subject"
                placeholder="e.g. Cannot connect to office printer on 3rd floor"
                value={form.title}
                onChange={set('title')}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ── Service Provider / Team selector ── */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Service Provider <span className="text-rose-500">*</span>
                </label>
                {teamsLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
                    Loading teams…
                  </div>
                ) : teams.length === 0 ? (
                  <div className="px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-700">
                    No service teams configured yet. Please contact your admin.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, teamName: team.name }))}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition ${
                          form.teamName === team.name
                            ? 'border-brand-400 bg-brand-50 text-brand-800 font-semibold shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold">{team.name}</div>
                        {team.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-normal">{team.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {/* hidden input to trigger browser required validation */}
                <input
                  type="text"
                  required
                  value={form.teamName}
                  onChange={() => {}}
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Urgency / Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'LOW', label: 'Low', active: 'border-slate-400 text-slate-700 bg-slate-50' },
                    { id: 'MEDIUM', label: 'Medium', active: 'border-brand-300 text-brand-700 bg-brand-50' },
                    { id: 'HIGH', label: 'High / Critical', active: 'border-rose-300 text-rose-700 bg-rose-50' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                        priority === p.id
                          ? p.active
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Specific Error Message (If Any)"
                placeholder="e.g. Error Code: 0x80070057"
                value={form.errorMessage}
                onChange={set('errorMessage')}
              />
              <Input
                type="date"
                label="When did this issue start?"
                value={form.issueStartDate}
                onChange={set('issueStartDate')}
              />
            </div>

            <Textarea
              label="Detailed Description & Steps to Reproduce"
              rows={4}
              placeholder="Describe the exact error, steps to reproduce, or error messages you encountered..."
              value={form.description}
              onChange={set('description')}
              required
            />

            {/* Attachment Zone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Attachments (Optional)
              </label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  addFiles(e.dataTransfer.files)
                }}
                className="border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-2xl p-6 text-center bg-slate-50/50 transition cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,application/pdf,text/plain,.log,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
                <div className="text-slate-400 mb-2">📎</div>
                <p className="text-xs text-slate-600 font-medium">
                  Click to choose files, or drag and drop screenshots, log files, or docs here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, PDF, TXT, LOG, DOC, DOCX</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{Math.ceil(file.size / 1024)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="ml-3 rounded-lg px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => router.push('/portal/my-tickets')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting || !form.teamName}>
                {submitting ? 'Submitting...' : 'Submit Ticket →'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
