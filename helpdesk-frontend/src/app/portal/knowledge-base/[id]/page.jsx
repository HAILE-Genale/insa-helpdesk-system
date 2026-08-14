'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getArticle, getArticles, resolveImageUrl } from '@/lib/api/knowledgeBase';

function categoryIcon(category) {
  if (!category) return '📄';
  const c = category.toLowerCase();
  if (c.includes('network') || c.includes('vpn'))   return '🌐';
  if (c.includes('account') || c.includes('sso') || c.includes('password')) return '🔑';
  if (c.includes('email') || c.includes('software') || c.includes('erp') || c.includes('teams')) return '⚙️';
  if (c.includes('hardware') || c.includes('device') || c.includes('printer')) return '💻';
  return '📄';
}

/**
 * Parse the solution text into steps and notes.
 * Format written by agents/admin:
 *   Step 1: Title\nDetail text\n\nStep 2: Title\nDetail...\n\nNOTE: ...
 */
function parseSolution(solution) {
  if (!solution) return { steps: [], notes: [] };

  const blocks = solution.split(/\n\n+/);
  const steps = [];
  const notes = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // NOTE block
    if (/^NOTE:/i.test(trimmed)) {
      const noteText = trimmed.replace(/^NOTE:\s*/i, '').trim();
      // Split by ". " to get individual note bullets
      noteText.split(/\.\s+(?=[A-Z])/).forEach(n => {
        const clean = n.trim().replace(/\.$/, '');
        if (clean) notes.push(clean);
      });
      continue;
    }

    // Step block: "Step N: Title\nDetail"
    const stepMatch = trimmed.match(/^Step\s+(\d+):\s*(.+?)(?:\n([\s\S]*))?$/i);
    if (stepMatch) {
      steps.push({
        step: parseInt(stepMatch[1], 10),
        title: stepMatch[2].trim(),
        detail: (stepMatch[3] || '').trim(),
      });
      continue;
    }

    // Fallback: treat as a plain note
    notes.push(trimmed);
  }

  return { steps, notes };
}

export default function KnowledgeBaseArticlePage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [article, setArticle]     = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [feedback, setFeedback]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getArticle(id),
      getArticles().catch(() => ({ data: [] })),
    ])
      .then(([artRes, allRes]) => {
        const art = artRes?.data ?? artRes;
        setArticle(art);

        // Pick up to 3 related articles from same category (excluding current)
        const all = allRes?.data ?? allRes ?? [];
        const rel = Array.isArray(all)
          ? all.filter(a => a.id !== art?.id && a.category === art?.category).slice(0, 3)
          : [];
        setRelated(rel);
      })
      .catch((err) => setError(err.message || 'Article not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4 pt-6">
        <div className="h-6 bg-slate-200 rounded w-1/3" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-24 bg-slate-100 rounded-2xl" />
        <div className="h-48 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-lg font-bold text-slate-700">Article not found</h2>
        <p className="text-xs text-slate-400 mt-1">{error || 'This article may have been moved or deleted.'}</p>
        <Link href="/portal/knowledge-base">
          <Button variant="outline" size="sm" className="mt-4">← Back to Knowledge Base</Button>
        </Link>
      </div>
    );
  }

  const { steps, notes } = parseSolution(article.solution);
  const icon = categoryIcon(article.category);
  const imageUrl = resolveImageUrl(article.image);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/portal/knowledge-base"
          className="text-xs text-brand-600 hover:underline font-semibold inline-flex items-center gap-1">
          ← Knowledge Base
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl flex-shrink-0">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">#{article.id}</span>
                {article.category && (
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                    {article.category}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{article.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {article.authorName && <>By {article.authorName} · </>}
                {article.views ?? 0} views
              </p>
            </div>
           </div>

           {/* Article Image */}
           {imageUrl && (
             <div className="rounded-2xl border border-slate-200 overflow-hidden">
               <img src={imageUrl} alt={article.title}
                 className="w-full h-64 md:h-80 object-cover" />
             </div>
           )}

           {/* Problem */}
          {article.problem && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
              <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">🔴 Problem</h2>
              <p className="text-sm text-rose-900 leading-relaxed">{article.problem}</p>
            </div>
          )}

          {/* Cause */}
          {article.cause && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">🟡 Cause</h2>
              <p className="text-sm text-amber-900 leading-relaxed">{article.cause}</p>
            </div>
          )}

          {/* Solution steps */}
          {steps.length > 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4">
                ✅ Solution — Step by Step
              </h2>
              <div className="space-y-5">
                {steps.map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.title}</p>
                      {s.detail && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{s.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : article.solution ? (
            /* Fallback: render solution as plain text if no Step N: pattern found */
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">✅ Solution</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{article.solution}</p>
            </div>
          ) : null}

          {/* Notes */}
          {notes.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📌 Notes & Tips</h2>
              <ul className="space-y-2">
                {notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-slate-400 mt-0.5 shrink-0">•</span>
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-3">Was this article helpful?</p>
            {feedback ? (
              <p className="text-sm text-emerald-600 font-semibold">
                {feedback === 'yes' ? '👍 Thanks for your feedback!' : "👎 We'll work on improving this article."}
              </p>
            ) : (
              <div className="flex justify-center gap-3">
                <button onClick={() => setFeedback('yes')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition">
                  👍 Yes, it helped
                </button>
                <button onClick={() => setFeedback('no')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition">
                  👎 Not really
                </button>
              </div>
            )}
          </div>

          {/* Submit ticket CTA */}
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-700">Still not resolved?</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Submit a ticket and an IT agent will help you directly.</p>
            <Button variant="primary" size="sm" onClick={() => router.push('/portal/new-ticket')}>
              Submit a Support Ticket →
            </Button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Tags */}
          {article.tags && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                  <span key={tag}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Related Articles</h3>
              <div className="space-y-2">
                {related.map(a => (
                  <Link key={a.id} href={`/portal/knowledge-base/${a.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition cursor-pointer">
                      <span className="text-lg">{categoryIcon(a.category)}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{a.title}</p>
                        {a.category && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{a.category}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>Views</span>
              <span className="font-semibold text-slate-700">{article.views ?? 0}</span>
            </div>
            {article.authorName && (
              <div className="flex justify-between">
                <span>Author</span>
                <span className="font-semibold text-slate-700">{article.authorName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Status</span>
              <span className={`font-bold uppercase ${article.status === 'PUBLISHED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {article.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
