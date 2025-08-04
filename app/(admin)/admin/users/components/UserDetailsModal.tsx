// app/admin/users/components/UserDetailsModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { UserInfo, UserActivity, apiService } from '../../../lib/apiService';

interface UserDetailsModalProps {
  user: UserInfo;
  onClose: () => void;
  onRefresh: () => void;
}

export default function UserDetailsModal({ user, onClose, onRefresh }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'credits'>('details');
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [userCredits, setUserCredits] = useState<number>(user.credits);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadUserActivity();
    } else if (activeTab === 'credits') {
      loadUserCredits();
    }
  }, [activeTab]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserActivity(user.id);
      setActivity(response.activities);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserCredits = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserCredits(user.id);
      setUserCredits(response.credits);
    } catch (error) {
      console.error('Failed to load user credits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get role badge
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

  const tabs = [
    { id: 'details', label: 'Details', icon: '👤' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'credits', label: 'Credits', icon: '💰' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || 'Unknown User'}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-6 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1">
                    {getRoleBadge(user.role)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credits</label>
                  <p className="mt-1 text-sm text-gray-900">{user.credits?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.createdAt && user.createdAt !== "0001-01-01T00:00:00Z" 
                      ? apiService.formatDate(user.createdAt) 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.lastLoginAt && user.lastLoginAt !== "0001-01-01T00:00:00Z" 
                      ? apiService.formatDate(user.lastLoginAt) 
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading activity...</p>
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
                  <p className="text-gray-600">This user hasn't performed any actions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.action}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {apiService.formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'credits' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading credits...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {userCredits?.toLocaleString() || '0'} Credits
                  </h3>
                  <p className="text-gray-600">Current credit balance</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}