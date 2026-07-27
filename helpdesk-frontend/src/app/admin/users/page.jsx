'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminUsersPage() {
  const users = [
    {
      id: 'USR-001',
      name: 'Haile-Genale',
      email: 'haile@insa.gov.et',
      role: 'ADMIN',
      department: 'IT Infrastructure',
      status: 'ACTIVE',
    },
    {
      id: 'USR-002',
      name: 'Abebe Bikila',
      email: 'abebe.b@insa.gov.et',
      role: 'SUPPORT_AGENT',
      department: 'Tier-2 Technical Support',
      status: 'ACTIVE',
    },
    {
      id: 'USR-003',
      name: 'Tigist Alemu',
      email: 'tigist.a@insa.gov.et',
      role: 'SUPPORT_AGENT',
      department: 'Tier-1 Helpdesk',
      status: 'ACTIVE',
    },
    {
      id: 'USR-004',
      name: 'Kassahun Worku',
      email: 'kassahun.w@insa.gov.et',
      role: 'END_USER',
      department: 'Cyber Security Operations',
      status: 'INACTIVE',
    },
  ];

  return (
    <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage accounts, role assignments (Admin, Agent, Manager, End User), and security policies.
              </p>
            </div>
            <Button variant="primary" size="sm">
              + Invite New User
            </Button>
          </div>

          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Accounts</CardTitle>
                <CardDescription>Total 4 registered active users</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  className="px-3 py-1.5 text-xs rounded-xl glass-input placeholder-slate-400 focus:outline-none"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="p-3.5 pl-6">User ID</th>
                      <th className="p-3.5">Name & Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-6 font-mono font-bold text-slate-400">{u.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-slate-500">{u.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">{u.department}</td>
                        <td className="p-3.5">
                          <Badge variant={u.status === 'ACTIVE' ? 'resolved' : 'default'}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right pr-6">
                          <Button variant="ghost" size="sm">
                            Edit Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
    </>
  );
}
