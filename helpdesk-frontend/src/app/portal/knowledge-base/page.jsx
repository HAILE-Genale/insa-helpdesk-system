'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { getArticles } from '@/lib/api/knowledgeBase';

// Icon map by category keyword
function categoryIcon(category) {
  if (!category) return '📄';
  const c = category.toLowerCase();
  if (c.includes('network') || c.includes('vpn'))   return '🌐';
  if (c.includes('account') || c.includes('sso') || c.includes('password')) return '🔑';
  if (c.includes('email') || c.includes('software') || c.includes('erp') || c.includes('teams')) return '⚙️';
  if (c.includes('hardware') || c.includes('device') || c.includes('printer')) return '💻';
  return '📄';
}

export default function KnowledgeBasePage() {
  const [articles, setArticles]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const router = useRouter();

  useEffect(() => {
    getArticles()
      .then((res) => {
        const list = res?.data ?? res ?? [];
        setArticles(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err.message || 'Failed to load articles'))
      .finally(() => setLoading(false));
  }, []);

  // Derive categories dynamically from data
  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (a.title || '').toLowerCase().includes(q) ||
      (a.problem || '').toLowerCase().includes(q) ||
      (a.tags || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q);
    const matchCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-3xl mx-auto mb-4">
          📚
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Find quick answers, guides, and step-by-step solutions from the INSA IT Helpdesk team.
        </p>
        <div className="relative mt-5 max-w-xl mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 glass-input focus:outline-none focus:border-brand-400 transition shadow-sm"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              activeCategory === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} articles</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Articles grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔎</div>
          <h3 className="text-sm font-bold text-slate-700">No articles found</h3>
          <p className="text-xs text-slate-500 mt-1">Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((article) => (
            <Link key={article.id} href={`/portal/knowledge-base/${article.id}`}>
              <Card glass className="hover:border-brand-300 cursor-pointer group transition h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-xl flex items-center justify-center flex-shrink-0">
                      {categoryIcon(article.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          #{article.id}
                        </span>
                        {article.category && (
                          <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                            {article.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                        {article.problem}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
                        <span>👁️ {article.views ?? 0} views</span>
                        {article.authorName && <span>✍️ {article.authorName}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Submit ticket CTA */}
      <div className="mt-10 text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <p className="text-sm font-semibold text-slate-700">Can't find what you're looking for?</p>
        <p className="text-xs text-slate-500 mt-1 mb-4">Submit a support ticket and an IT agent will assist you.</p>
        <Button variant="primary" size="sm" onClick={() => router.push('/portal/new-ticket')}>
          Submit a Ticket →
        </Button>
      </div>
    </>
  );
}
