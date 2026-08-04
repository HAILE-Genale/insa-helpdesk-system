'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Input, Select, Textarea } from '@/components/ui/input'
import { getCategories } from '@/lib/api/categories'

export default function NewTicketPage() {
  const [submitted, setSubmitted] = useState(false)
  const [priority, setPriority] = useState('MEDIUM')
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data.filter((category) => category.active))
      } catch (err) {
        console.error(err)
      }
    }

    loadCategories()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create Support Ticket
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill out the form below to route your request to the right IT
            support team.
          </p>
        </div>
        <Link href="/portal/my-tickets">
          <Button variant="outline" size="sm">
            Cancel & Return
          </Button>
        </Link>
      </div>

      {submitted ? (
        <Card className="text-center p-8 bg-emerald-50/50 border-emerald-200 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Ticket Submitted Successfully!
          </h2>
          <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
            Your ticket reference is{' '}
            <span className="font-mono font-bold text-slate-800">#TK-8942</span>
            . An IT agent will be assigned shortly.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/portal/my-tickets">
              <Button variant="primary">View My Tickets</Button>
            </Link>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Create Another
            </Button>
          </div>
        </Card>
      ) : (
        <Card glass>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User & Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Department / Directorate"
                  options={[
                    { value: 'it', label: 'IT & Infrastructure' },
                    { value: 'hr', label: 'Human Resources' },
                    { value: 'finance', label: 'Finance & Procurement' },
                    { value: 'cyber', label: 'Cyber Operations' },
                    { value: 'legal', label: 'Legal & Policy' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <Input
                  label="Office Location / Room Number"
                  placeholder="e.g. Building A, Room 302"
                />
                <Input label="Contact Phone Number" placeholder="+251 9..." />
                <Input
                  label="Device Asset Tag (Optional)"
                  placeholder="e.g. INSA-LT-001"
                />
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Input
                  label="Ticket Title / Subject"
                  placeholder="e.g. Cannot connect to office printer on 3rd floor"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  options={[
                    { value: '', label: 'Select a category' },
                    ...categories.map((category) => ({
                      value: String(category.id),
                      label: category.classificationName
                        ? `${category.name} (${category.classificationName})`
                        : category.name
                    }))
                  ]}
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Urgency / Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'LOW',
                        label: 'Low',
                        class: 'border-slate-200 text-slate-700'
                      },
                      {
                        id: 'MEDIUM',
                        label: 'Medium',
                        class: 'border-brand-300 text-brand-700 bg-brand-50'
                      },
                      {
                        id: 'HIGH',
                        label: 'High / Critical',
                        class: 'border-rose-300 text-rose-700 bg-rose-50'
                      }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                          priority === p.id
                            ? p.class
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
                />
                <Input type="date" label="When did this issue start?" />
              </div>

              <Textarea
                label="Detailed Description & Steps to Reproduce"
                rows={4}
                placeholder="Describe the exact error, steps to reproduce, or error messages you encountered..."
                required
              />

              {/* Attachment Zone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-2xl p-6 text-center bg-slate-50/50 transition cursor-pointer">
                  <div className="text-slate-400 mb-2">📎</div>
                  <p className="text-xs text-slate-600 font-medium">
                    Drag and drop screenshots, log files, or docs here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <Link href="/portal/my-tickets">
                  <Button variant="ghost">Cancel</Button>
                </Link>
                <Button variant="primary" type="submit">
                  Submit Ticket →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
