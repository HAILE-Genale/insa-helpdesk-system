'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Minimal Top Header */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <section className="text-center max-w-3xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold shadow-sm mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            🇪🇹 INSA Ethiopia • IT Helpdesk
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-900">
            Modern IT Helpdesk for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600">
              INSA Ethiopia
            </span>
          </h1>

          {/* Minimal Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Fast, seamless technical helpdesk and self-service for every department.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?next=%2Fportal%2Fnew-ticket">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/25 rounded-2xl active:scale-95 transition">
                Get Started →
              </Button>
            </Link>
            <Link href="/portal/my-tickets">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-2xl">
                Track My Tickets
              </Button>
            </Link>
          </div>
        </section>

        {/* 3 Visual Action Cards */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card className="glass-card hover:-translate-y-1.5 transition-all duration-300 border-white/80 p-6 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-2xl mb-4 border border-brand-200/60 shadow-sm">
                💻
              </div>
              <h3 className="text-xl font-bold text-slate-900">Submit Helpdesk Ticket</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Report hardware, software, network, or access issues to IT specialists.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/login?next=%2Fportal%2Fnew-ticket" className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 gap-1">
                Get Started <span>→</span>
              </Link>
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="glass-card hover:-translate-y-1.5 transition-all duration-300 border-white/80 p-6 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl mb-4 border border-amber-200/60 shadow-sm">
                📂
              </div>
              <h3 className="text-xl font-bold text-slate-900">My Requests</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Check real-time status updates and agent replies for active tickets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/portal/my-tickets" className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-900 gap-1">
                View My Tickets <span>→</span>
              </Link>
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="glass-card hover:-translate-y-1.5 transition-all duration-300 border-white/80 p-6 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl mb-4 border border-emerald-200/60 shadow-sm">
                📚
              </div>
              <h3 className="text-xl font-bold text-slate-900">Knowledge Base</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Instant self-service guides for VPN, email setup, and printers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/portal/knowledge-base" className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 gap-1">
                Search Solutions <span>→</span>
              </Link>
            </div>
          </Card>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="glass-nav border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} INSA Ethiopia IT Helpdesk. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
