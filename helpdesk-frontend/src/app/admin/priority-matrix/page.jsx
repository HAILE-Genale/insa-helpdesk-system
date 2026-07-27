'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminPriorityMatrixPage() {
  return (
    <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">ITIL Priority Matrix</h1>
            <p className="text-xs text-slate-500 mt-1">Automatic priority calculation based on organizational Impact vs Urgency.</p>
          </div>

          <Card glass>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-3 text-center text-xs font-bold">
                <div className="p-3 bg-slate-100 rounded-xl">Impact / Urgency</div>
                <div className="p-3 bg-slate-100 rounded-xl">Low Urgency</div>
                <div className="p-3 bg-slate-100 rounded-xl">Medium Urgency</div>
                <div className="p-3 bg-slate-100 rounded-xl">High Urgency</div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center">High Impact (Entire Org)</div>
                <div className="p-3 bg-amber-100 text-amber-900 rounded-xl border border-amber-300">MEDIUM</div>
                <div className="p-3 bg-rose-100 text-rose-900 rounded-xl border border-rose-300 font-extrabold">HIGH</div>
                <div className="p-3 bg-rose-600 text-white rounded-xl font-black shadow-md">CRITICAL</div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center">Medium Impact (Dept)</div>
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">LOW</div>
                <div className="p-3 bg-amber-100 text-amber-900 rounded-xl border border-amber-300">MEDIUM</div>
                <div className="p-3 bg-rose-100 text-rose-900 rounded-xl border border-rose-300">HIGH</div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center">Low Impact (Single User)</div>
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">LOW</div>
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">LOW</div>
                <div className="p-3 bg-amber-100 text-amber-900 rounded-xl border border-amber-300">MEDIUM</div>
              </div>
            </CardContent>
          </Card>
    </>
  );
}
