'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  fetchPriorityMatrix,
  updatePriorityMatrix,
  calculatePriority,
  Impact,
  Urgency
} from '@/lib/api/priority'

const IMPACT_LABELS = {
  HIGH: 'High Impact (Entire Org)',
  MEDIUM: 'Medium Impact (Dept)',
  LOW: 'Low Impact (Single User)'
}

const URGENCY_ORDER = [Urgency.HIGH, Urgency.MEDIUM, Urgency.LOW]
const IMPACT_ORDER = [Impact.HIGH, Impact.MEDIUM, Impact.LOW]

const PRIORITY_STYLES = {
  CRITICAL: 'bg-rose-600 text-white border-rose-600',
  HIGH: 'bg-rose-100 text-rose-900 border-rose-300',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-300',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200'
}

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function AdminPriorityMatrixPage() {
  const [matrix, setMatrix] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // Demo calculation state
  const [demoImpact, setDemoImpact] = useState(Impact.HIGH)
  const [demoUrgency, setDemoUrgency] = useState(Urgency.HIGH)
  const [demoResult, setDemoResult] = useState(null)

  const key = (impact, urgency) => `${impact}/${urgency}`

  const buildDefaultMatrix = () => {
    const values = {}
    IMPACT_ORDER.forEach((impact) => {
      URGENCY_ORDER.forEach((urgency) => {
        values[key(impact, urgency)] = PRIORITY_OPTIONS[0]
      })
    })
    return values
  }

  const loadMatrix = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchPriorityMatrix()
      const byKey = buildDefaultMatrix()
      rows.forEach((r) => {
        byKey[key(r.impact, r.urgency)] = r.resultingPriority
      })
      setMatrix(byKey)
    } catch (err) {
      setError('Could not load the priority matrix from the API.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMatrix()
  }, [loadMatrix])

  const setCell = (impact, urgency, value) => {
    setMatrix((prev) => ({ ...prev, [key(impact, urgency)]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const rows = IMPACT_ORDER.flatMap((impact) =>
        URGENCY_ORDER.map((urgency) => ({
          impact,
          urgency,
          resultingPriority: matrix[key(impact, urgency)] ?? PRIORITY_OPTIONS[0]
        }))
      )

      await updatePriorityMatrix(rows)
      setMessage('Priority matrix saved.')
    } catch (err) {
      setError(err?.message || 'Failed to save the priority matrix.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setDemoResult(null)
    setMessage(null)
    loadMatrix()
  }

  const handleCalculate = async () => {
    setError(null)
    setDemoResult(null)
    try {
      const result = await calculatePriority(demoImpact, demoUrgency)
      setDemoResult(result)
    } catch (err) {
      setError('Could not calculate priority.')
      console.error(err)
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          ITIL Priority Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Automatic priority calculation based on organizational Impact vs
          Urgency. Click a cell to change it, then Save.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          {message}
        </div>
      )}

      <Card glass>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-sm text-slate-500">Loading matrix…</div>
          ) : (
            <div className="grid grid-cols-4 gap-3 text-center text-xs font-bold">
              <div className="p-3 bg-slate-100 rounded-xl">
                Impact / Urgency
              </div>
              {URGENCY_ORDER.map((urgency) => (
                <div key={urgency} className="p-3 bg-slate-100 rounded-xl">
                  {urgency} Urgency
                </div>
              ))}

              {IMPACT_ORDER.map((impact) => (
                <React.Fragment key={impact}>
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center">
                    {IMPACT_LABELS[impact]}
                  </div>
                  {URGENCY_ORDER.map((urgency) => {
                    const value =
                      matrix[key(impact, urgency)] ?? PRIORITY_OPTIONS[0]
                    const style =
                      PRIORITY_STYLES[value] || PRIORITY_STYLES.MEDIUM
                    return (
                      <select
                        key={urgency}
                        value={value}
                        onChange={(e) =>
                          setCell(impact, urgency, e.target.value)
                        }
                        className={`p-2 rounded-xl border text-center font-bold cursor-pointer appearance-none ${style}`}
                        aria-label={`${IMPACT_LABELS[impact]} / ${urgency} urgency`}
                      >
                        {PRIORITY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex gap-3">
        <Button onClick={handleSave} isLoading={saving} disabled={loading}>
          Save Matrix
        </Button>
        <Button variant="secondary" onClick={handleReset} disabled={loading}>
          Reset
        </Button>
      </div>

      <Card glass className="mt-6">
        <CardHeader>
          <CardTitle>Test Calculation</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Impact
              </label>
              <select
                value={demoImpact}
                onChange={(e) => setDemoImpact(e.target.value)}
                className="px-3 py-2 border rounded-xl text-sm"
              >
                {IMPACT_ORDER.map((impact) => (
                  <option key={impact} value={impact}>
                    {IMPACT_LABELS[impact]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Urgency
              </label>
              <select
                value={demoUrgency}
                onChange={(e) => setDemoUrgency(e.target.value)}
                className="px-3 py-2 border rounded-xl text-sm"
              >
                {URGENCY_ORDER.map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {urgency} Urgency
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={handleCalculate}>
              Calculate
            </Button>
            {demoResult && (
              <span
                className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${PRIORITY_STYLES[demoResult]}`}
              >
                {demoResult}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
