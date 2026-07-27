'use client';

import React, { useEffect, useState } from 'react';
import { loginWithCredentials, loginAsRole, DEMO_ACCOUNTS, ROLE_LABELS } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

const ROLE_GROUPS = [
  {
    role:    'portal',
    label:   'Staff Portal',
    emoji:   '👤',
    color:   'from-brand-600 to-indigo-600',
    glow:    'shadow-brand-500/30',
    border:  'border-brand-400/30',
    desc:    'Submit & track IT support tickets',
  },
  {
    role:    'agent',
    label:   'Agent Workspace',
    emoji:   '🎧',
    color:   'from-emerald-600 to-teal-600',
    glow:    'shadow-emerald-500/30',
    border:  'border-emerald-400/30',
    desc:    'Manage and resolve the support queue',
  },
  {
    role:    'manager',
    label:   'Manager View',
    emoji:   '📈',
    color:   'from-amber-500 to-orange-600',
    glow:    'shadow-amber-500/30',
    border:  'border-amber-400/30',
    desc:    'Monitor team performance & escalations',
  },
  {
    role:    'admin',
    label:   'Admin Console',
    emoji:   '⚙️',
    color:   'from-violet-600 to-purple-700',
    glow:    'shadow-violet-500/30',
    border:  'border-violet-400/30',
    desc:    'System configuration & user management',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [nextPath, setNextPath] = useState(null);
  const [email,    setEmail]    = useState('');

  useEffect(() => {
    setNextPath(new URLSearchParams(window.location.search).get('next'));
  }, []);
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);


  /* One-click instant login (no form needed) */
  function handleQuickLogin(role) {
    const user = loginAsRole(role);
    if (user) login(user, nextPath);
  }

  /* Manual form submit */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {                 // tiny artificial delay for UX
      const user = loginWithCredentials(email.trim(), password);
      setLoading(false);
      if (!user) {
        setError('Invalid email or password. Try a demo account below.');
        return;
      }
      login(user, nextPath);
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Card grid */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/80 grid grid-cols-1 lg:grid-cols-5">

          {/* ── Left branding panel ── */}
          <div className="lg:col-span-2 bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background art */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-lg">
                  <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-extrabold text-lg leading-none">INSA Ethiopia</div>
                  <div className="text-brand-200 text-xs mt-0.5">IT Helpdesk System</div>
                </div>
              </div>

              <h1 className="text-3xl font-black leading-tight">
                Enterprise<br />
                <span className="text-amber-300">IT Service</span><br />
                Desk
              </h1>
              <p className="mt-4 text-sm text-brand-100 leading-relaxed">
                Incident tracking, SLA management, and self-service support portal for every department.
              </p>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { label: 'Avg. Response',  value: '< 30 min' },
                  { label: 'SLA Compliance', value: '96%'      },
                  { label: 'Agents Online',  value: '12'       },
                  { label: 'Resolved Today', value: '38'       },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 border border-white/15 backdrop-blur-sm">
                    <div className="text-xl font-black text-white">{s.value}</div>
                    <div className="text-[10px] text-brand-200 mt-0.5 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethiopian flag strip */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-xs text-brand-200 font-medium">
                <span>🇪🇹</span>
                <span>Information Network Security Administration</span>
              </div>
              <div className="text-[10px] text-brand-300/70 mt-1">የኢንፎርሜሽን መረብ ደህንነት አስተዳደር</div>
            </div>
          </div>

          {/* ── Right login panel ── */}
          <div className="lg:col-span-3 p-8 md:p-10 flex flex-col justify-center bg-white/60">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in with your INSA organisation account</p>
            </div>

            {/* ── Manual login form ── */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="username@insa.gov.et"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl glass-input text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <a href="#" className="text-brand-600 font-semibold hover:text-brand-700">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition active:scale-95 shadow-lg shadow-brand-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign In to Portal →'
                )}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or try a demo account</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* ── One-click demo login cards ── */}
            <div className="grid grid-cols-2 gap-3">
              {ROLE_GROUPS.map((g) => {
                const acc = DEMO_ACCOUNTS.find((a) => a.role === g.role);
                return (
                  <button
                    key={g.role}
                    type="button"
                    onClick={() => handleQuickLogin(g.role)}
                    aria-label={`Sign in as ${acc?.name ?? g.label}, ${ROLE_LABELS[g.role]}`}
                    className={`group text-left p-3.5 rounded-2xl border bg-gradient-to-br ${g.color} ${g.border} shadow-lg ${g.glow} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg leading-none">{g.emoji}</span>
                      <span className="text-xs font-extrabold text-white tracking-wide">{g.label}</span>
                    </div>
                    <div className="text-[10px] text-white/70 leading-snug mb-2">{g.desc}</div>
                    {acc && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-white/25 text-white text-[9px] font-bold flex items-center justify-center">
                          {acc.avatar}
                        </div>
                        <span className="text-[10px] text-white/80 font-medium">{acc.name}</span>
                      </div>
                    )}
                    <div className="mt-2.5 text-[10px] text-white/60 font-mono">
                      {acc?.email} • {acc?.password}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-center text-[10px] text-slate-400">
              Protected by INSA Security Policy • Single Sign-On (SSO) Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
