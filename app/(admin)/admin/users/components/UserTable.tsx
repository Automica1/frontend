// app/admin/users/components/UserTable.tsx
"use client";

import React, { useState } from 'react';
import { UserInfo, apiService } from '../../../lib/apiService';
import UserDetailsModal from './UserDetailsModal';

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

  const getStatusBadge = (isActive: boolean = true) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role?: string) => {
    // Handle undefined role with fallback
    const userRole = role || 'user';
    const isAdmin = userRole.toLowerCase() === 'admin';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isAdmin ? '👑 Admin' : '👤 User'}
      </span>
    );
  };

  // Helper function to generate a safe key for each user row
  const getUserKey = (user: UserInfo, index: number): string => {
    // Use userId first (actual unique identifier), then id, then email, then index
    return user.userId || user.id || user.email || `user-${index}`;
  };

  // Filter out any invalid user objects
  const validUsers = users.filter(user => user && (user.userId || user.id || user.email));

  if (validUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {validUsers.map((user, index) => (
                <tr key={getUserKey(user, index)} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.credits ? user.credits.toLocaleString() : '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt && user.createdAt !== "0001-01-01T00:00:00Z" 
                      ? apiService.formatDate(user.createdAt) 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt && user.lastLoginAt !== "0001-01-01T00:00:00Z" 
                      ? apiService.formatDate(user.lastLoginAt) 
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      disabled={!user.userId && !user.id} // Disable if no userId or ID available
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
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