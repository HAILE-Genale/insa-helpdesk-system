'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  getCategories,
  createCategory,
  updateCategory
} from '@/lib/api/categories'
import { getClassifications } from '@/lib/api/classifications'

const palette = [
  {
    bg: 'bg-brand-100',
    text: 'text-brand-700',
    border: 'border-brand-200',
    subBg: 'bg-brand-50/50'
  },
  {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    subBg: 'bg-emerald-50/50'
  },
  {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
    subBg: 'bg-violet-50/50'
  },
  {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    subBg: 'bg-amber-50/50'
  }
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newActive, setNewActive] = useState(true)
  const [newClassificationId, setNewClassificationId] = useState('')
  const [classifications, setClassifications] = useState([])
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editClassificationId, setEditClassificationId] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadClassifications = async () => {
    try {
      const data = await getClassifications()
      setClassifications(data.filter((classification) => classification.active))
    } catch (err) {
      console.error(err)
    }
  }

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id)
    setEditName(category.name || '')
    setEditDescription(category.description || '')
    setEditActive(category.active ?? true)
    setEditClassificationId(
      category.classificationId ? String(category.classificationId) : ''
    )
    setError(null)
    setSuccessMessage(null)
  }

  const cancelEdit = () => {
    setEditingCategoryId(null)
    setEditName('')
    setEditDescription('')
    setEditActive(true)
    setEditClassificationId('')
  }

  const handleUpdateCategory = async (categoryId) => {
    if (!editName.trim()) {
      setError('Category name is required.')
      return
    }
    if (!editClassificationId) {
      setError('Category classification is required.')
      return
    }

    setEditLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await updateCategory(categoryId, {
        name: editName.trim(),
        description: editDescription.trim(),
        active: editActive,
        classificationId: editClassificationId
          ? Number(editClassificationId)
          : null
      })
      setSuccessMessage('Category updated successfully.')
      cancelEdit()
      await loadCategories()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to update category.')
    } finally {
      setEditLoading(false)
    }
  }

  const loadCategories = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCategories()
      setCategories(data)
      setExpanded((prev) => {
        if (Object.keys(prev).length) {
          return prev
        }
        return data.reduce((acc, category, index) => {
          if (index === 0) {
            acc[category.id] = true
          }
          return acc
        }, {})
      })
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to load categories from the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
    loadClassifications()
  }, [])

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    if (!newName.trim()) {
      setError('Category name is required.')
      return
    }

    if (!newClassificationId) {
      setError('Category classification is required.')
      return
    }

    setSaveLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await createCategory({
        name: newName.trim(),
        description: newDescription.trim(),
        active: newActive,
        classificationId: newClassificationId
          ? Number(newClassificationId)
          : null
      })
      setSuccessMessage('Category created successfully.')
      setNewName('')
      setNewDescription('')
      setNewActive(true)
      setNewClassificationId('')
      setShowCreateForm(false)
      await loadCategories()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to create category.')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ticket Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage ticket categories and classification routing for service
            requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadCategories}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowCreateForm((prev) => !prev)
              setError(null)
              setSuccessMessage(null)
            }}
          >
            + Add Category
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card glass className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Category
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add a category now and assign classification later.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Category Name
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Hardware & Devices"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Active
                <select
                  value={newActive ? 'true' : 'false'}
                  onChange={(e) => setNewActive(e.target.value === 'true')}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Classification
              <select
                value={newClassificationId}
                onChange={(e) => setNewClassificationId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              >
                <option value="">Choose classification</option>
                {classifications.map((classification) => (
                  <option key={classification.id} value={classification.id}>
                    {classification.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                placeholder="Optional description for this category"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateCategory}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving…' : 'Create Category'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          No categories available yet. Use the backend APIs to create ticket
          categories and classification mappings.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => {
            const colors = palette[index % palette.length]
            const isOpen = !!expanded[category.id]

            return (
              <Card
                key={category.id}
                glass
                className={`border ${colors.border} overflow-hidden`}
              >
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/60 transition"
                    onClick={() => toggle(category.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-2xl flex-shrink-0`}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          CAT-{category.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Classification:{' '}
                          <strong className="text-slate-700">
                            {category.classificationName || 'Not assigned'}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors.border} ${colors.bg} ${colors.text}`}
                      >
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditCategory(category)
                        }}
                      >
                        Edit
                      </Button>
                      <span
                        className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                      >
                        ▶
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      className={`border-t border-slate-200/80 ${colors.subBg} px-5 py-4`}
                    >
                      {editingCategoryId === category.id ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Category Name
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                              />
                            </label>

                            <label className="block text-sm font-medium text-slate-700">
                              Active
                              <select
                                value={editActive ? 'true' : 'false'}
                                onChange={(e) =>
                                  setEditActive(e.target.value === 'true')
                                }
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </label>
                          </div>

                          <label className="block text-sm font-medium text-slate-700">
                            Classification
                            <select
                              value={editClassificationId}
                              onChange={(e) =>
                                setEditClassificationId(e.target.value)
                              }
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                              required
                            >
                              <option value="">Choose classification</option>
                              {classifications.map((classification) => (
                                <option
                                  key={classification.id}
                                  value={classification.id}
                                >
                                  {classification.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block text-sm font-medium text-slate-700">
                            Description
                            <textarea
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                              rows={3}
                            />
                          </label>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateCategory(category.id)}
                              disabled={editLoading}
                            >
                              {editLoading ? 'Saving…' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-slate-700">
                              {category.description ||
                                'No description provided.'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                              Classification
                            </h4>
                            <p className="text-sm text-slate-700">
                              {category.classificationName || 'Not assigned'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold mb-2">
                              Category ID
                            </h4>
                            <p className="text-sm text-slate-700">
                              {category.id}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
