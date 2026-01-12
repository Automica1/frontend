// app/admin/users/components/UserTable.tsx
"use client";

import React, { useState } from 'react';
import { UserInfo, apiService } from '../../../lib/apiService';
import UserDetailsModal from './UserDetailsModal';
import { Eye, User, Calendar, Database, Mail } from 'lucide-react';

interface UserTableProps {
  users: UserInfo[];
  onRefresh: () => void;
}

export default function UserTable({ users, onRefresh }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewUser = (user: UserInfo) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") {
      return 'N/A';
    }
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getUserKey = (user: UserInfo, index: number): string => {
    return user.userId || user.id || user.email || `user-${index}`;
  };

  const validUsers = users.filter(user => user && (user.userId || user.id || user.email));

  if (validUsers.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-admin-text-main mb-2">No results found</h3>
        <p className="text-admin-text-muted text-sm font-medium">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-border">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-left text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                User / Account
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-admin-text-muted uppercase tracking-widest hidden lg:table-cell">
                Identifier
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                Credits Balance
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-admin-text-muted uppercase tracking-widest hidden md:table-cell">
                Registered On
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border bg-white">
            {validUsers.map((user, index) => (
              <tr key={getUserKey(user, index)} className="group hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-admin-primary/5 rounded-xl flex items-center justify-center border border-admin-primary/10">
                      <Mail className="w-4 h-4 text-admin-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-admin-text-main group-hover:text-admin-primary transition-colors">
                        {user.email || 'No email'}
                      </div>
                      <div className="text-[10px] font-bold text-admin-text-muted uppercase tracking-tighter sm:hidden">
                        {user.userId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-admin-text-muted w-fit">
                    {user.userId || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                      <Database className="w-3 h-3" />
                      {user.credits ? user.credits.toLocaleString() : '0'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-xs font-bold text-admin-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleViewUser(user)}
                    className="p-2 text-admin-text-muted hover:text-admin-primary hover:bg-admin-primary/5 rounded-xl transition-all"
                    title="View Details"
                    disabled={!user.userId && !user.id}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedUser && (selectedUser.userId || selectedUser.id) && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
