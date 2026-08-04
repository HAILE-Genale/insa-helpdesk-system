'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActivityLogs } from '@/lib/api/activityLogs';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadLogs = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      const data = await getActivityLogs(currentPage, size);
      // Spring Data Page object returns content, totalPages, totalElements
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setError('');
    } catch (err) {
      setError('Failed to load activity logs. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    loadLogs(page);
  }, [loadLogs, page]);

  function handlePrevPage() {
    if (page > 0) setPage(page - 1);
  }

  function handleNextPage() {
    if (page < totalPages - 1) setPage(page + 1);
  }

  // Helper to format ISO string to "Aug 2, 2026, 7:45 PM"
  function formatTimestamp(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail of system access and account modifications.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl mb-4">
          <span>⚠️</span> {error}
        </div>
      )}

      <Card glass>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>System Audit Trail</CardTitle>
            <CardDescription>
              {loading ? 'Loading…' : `Showing page ${page + 1} of ${totalPages || 1} (${totalElements} total events)`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 0 || loading}
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages - 1 || loading}
            >
              Next →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="p-3.5 pl-6">ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5 pr-6">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin mr-2" />
                      Loading logs…
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 pl-6 font-mono font-bold text-slate-400">{log.id}</td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{formatTimestamp(log.createdAt)}</td>
                      <td className="p-3.5 font-bold text-slate-900">{log.username}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-[10px] uppercase tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 pr-6">{log.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
