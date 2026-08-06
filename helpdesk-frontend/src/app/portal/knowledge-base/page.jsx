'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const articles = [
  {
    id: 'KB-001',
    title: 'How to Connect to INSA VPN (Cisco AnyConnect)',
    category: 'Network & VPN',
    views: 214,
    helpful: 98,
    updatedAt: '2 days ago',
    icon: '🌐',
    excerpt: 'Step-by-step guide to install and configure Cisco AnyConnect VPN client for remote access to INSA internal network.',
  },
  {
    id: 'KB-002',
    title: 'Resetting Your Active Directory (AD) Password',
    category: 'Accounts & SSO',
    views: 189,
    helpful: 95,
    updatedAt: '1 week ago',
    icon: '🔑',
    excerpt: 'How to reset your Windows/AD password using the self-service portal without contacting the helpdesk.',
  },
  {
    id: 'KB-003',
    title: 'Setting Up Outlook Email on a New Device',
    category: 'Software & Email',
    views: 143,
    helpful: 91,
    updatedAt: '3 days ago',
    icon: '📧',
    excerpt: 'Configure INSA Microsoft 365 Outlook on desktop, mobile, or browser. Includes SMTP/IMAP settings and MFA setup.',
  },
  {
    id: 'KB-004',
    title: 'Connecting to Office Printers on the Internal Network',
    category: 'Hardware & Devices',
    views: 102,
    helpful: 87,
    updatedAt: '5 days ago',
    icon: '🖨️',
    excerpt: 'Install and configure shared network printers on Windows 10/11. Includes Canon and HP printer driver downloads.',
  },
  {
    id: 'KB-005',
    title: 'Request for New Hardware – Procedure Guide',
    category: 'Hardware & Devices',
    views: 88,
    helpful: 82,
    updatedAt: '1 week ago',
    icon: '💻',
    excerpt: 'How to submit a formal hardware request through the helpdesk portal, including required approvals from your department manager.',
  },
  {
    id: 'KB-006',
    title: 'ERP System Login Troubleshooting',
    category: 'Software & Email',
    views: 76,
    helpful: 79,
    updatedAt: '4 days ago',
    icon: '⚙️',
    excerpt: 'Common ERP login errors, session timeout fixes, and steps to clear cache/cookies for the INSA internal ERP system.',
  },
  {
    id: 'KB-007',
    title: 'Computer Running Slow – Quick Fixes',
    category: 'Hardware & Devices',
    views: 165,
    helpful: 88,
    updatedAt: '3 days ago',
    icon: '🐢',
    excerpt: 'Step-by-step guide to diagnose and fix a slow computer: clearing startup programs, disk cleanup, RAM check, and more.',
  },
  {
    id: 'KB-008',
    title: 'Microsoft Teams: Audio & Video Not Working',
    category: 'Software & Email',
    views: 130,
    helpful: 85,
    updatedAt: '6 days ago',
    icon: '🎙️',
    excerpt: 'Fix microphone, speaker, and camera issues in Microsoft Teams meetings on Windows and Mac.',
  },
];

const categories = ['All', 'Network & VPN', 'Accounts & SSO', 'Software & Email', 'Hardware & Devices'];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const router = useRouter();

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCategory;
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
          Find quick answers, guides, and how-to articles from the INSA IT Helpdesk team.
        </p>

        {/* Search */}
        <div className="relative mt-5 max-w-xl mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search knowledge base articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 glass-input focus:outline-none focus:border-brand-400 transition shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter */}
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

      {/* Articles Grid */}
      {filtered.length === 0 ? (
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
                      {article.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400">{article.id}</span>
                        <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
                        <span>👁️ {article.views} views</span>
                        <span>👍 {article.helpful}% helpful</span>
                        <span>Updated {article.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Can't find answer */}
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
