'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const categoriesTree = [
  {
    id: 'CAT-01',
    name: 'Hardware & Devices',
    icon: '💻',
    team: 'Tier-1 Desktop Support',
    active: 8,
    color: 'brand',
    subcategories: [
      { id: 'SUB-01', name: 'Laptop / Desktop', tickets: 4 },
      { id: 'SUB-02', name: 'Printer & Scanner', tickets: 2 },
      { id: 'SUB-03', name: 'Monitors & Peripherals', tickets: 2 },
    ],
  },
  {
    id: 'CAT-02',
    name: 'Network & VPN',
    icon: '🌐',
    team: 'Network Operations (NOC)',
    active: 5,
    color: 'emerald',
    subcategories: [
      { id: 'SUB-04', name: 'Internet Connectivity', tickets: 2 },
      { id: 'SUB-05', name: 'VPN & Remote Access', tickets: 2 },
      { id: 'SUB-06', name: 'LAN / Switch Issues', tickets: 1 },
    ],
  },
  {
    id: 'CAT-03',
    name: 'Software & Email',
    icon: '⚙️',
    team: 'Application Support',
    active: 12,
    color: 'violet',
    subcategories: [
      { id: 'SUB-07', name: 'ERP / Core Applications', tickets: 5 },
      { id: 'SUB-08', name: 'Email & Outlook', tickets: 4 },
      { id: 'SUB-09', name: 'OS & Driver Issues', tickets: 3 },
    ],
  },
  {
    id: 'CAT-04',
    name: 'Accounts & SSO',
    icon: '🔑',
    team: 'IAM & Directory Team',
    active: 3,
    color: 'amber',
    subcategories: [
      { id: 'SUB-10', name: 'Password Reset', tickets: 1 },
      { id: 'SUB-11', name: 'AD Account Access', tickets: 1 },
      { id: 'SUB-12', name: 'App Permissions (RBAC)', tickets: 1 },
    ],
  },
];

const colorMap = {
  brand: { bg: 'bg-brand-100', text: 'text-brand-700', border: 'border-brand-200', subBg: 'bg-brand-50/50' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', subBg: 'bg-emerald-50/50' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', subBg: 'bg-violet-50/50' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', subBg: 'bg-amber-50/50' },
};

export default function AdminCategoriesPage() {
  const [expanded, setExpanded] = useState({ 'CAT-01': true });

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ticket Categories</h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure categories, sub-categories, and team routing rules. (FR-016 / FR-017 / FR-025)
              </p>
            </div>
            <Button variant="primary" size="sm">+ Add Category</Button>
          </div>

          <div className="space-y-4">
            {categoriesTree.map((cat) => {
              const colors = colorMap[cat.color] || colorMap.brand;
              const isOpen = !!expanded[cat.id];
              return (
                <Card key={cat.id} glass className={`border ${colors.border} overflow-hidden`}>
                  {/* Category Header Row */}
                  <CardContent className="p-0">
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/60 transition"
                      onClick={() => toggle(cat.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>
                          {cat.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{cat.id}</span>
                          <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Routes to: <strong className="text-slate-700">{cat.team}</strong>
                            <span className="mx-2 text-slate-300">·</span>
                            {cat.subcategories.length} sub-categories
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors.border} ${colors.bg} ${colors.text}`}>
                          {cat.active} Active
                        </span>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>Edit</Button>
                        <span className={`text-slate-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                      </div>
                    </div>

                    {/* Sub-category Drawer */}
                    {isOpen && (
                      <div className={`border-t border-slate-200/80 ${colors.subBg} px-5 py-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sub-Categories</p>
                          <button className={`text-[11px] font-semibold ${colors.text} hover:underline`}>
                            + Add Sub-Category
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 hover:border-slate-300 transition"
                            >
                              <div>
                                <div className="text-[9px] font-mono text-slate-400">{sub.id}</div>
                                <div className="text-xs font-semibold text-slate-800">{sub.name}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500">{sub.tickets} tickets</span>
                                <button className="text-slate-400 hover:text-slate-600 text-xs">✏️</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
    </>
  );
}
