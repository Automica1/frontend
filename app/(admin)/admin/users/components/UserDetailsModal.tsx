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
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'credits' | 'actions'>('details');
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

  const tabs = [
    { id: 'details', label: 'Details', icon: '👤' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'credits', label: 'Credits', icon: '💰' },
    { id: 'actions', label: 'Actions', icon: '⚙️' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.userId || 'Unknown User'}</h2>
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
                  <p className="mt-1 text-sm text-gray-900 font-mono">{user.userId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credits</label>
                  <p className="mt-1 text-sm text-gray-900">{user.credits?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Updated At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
              
              {/* Additional Info Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Credits</p>
                      <p className="text-2xl font-bold text-blue-600">{user.credits?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="text-blue-500 text-2xl">💰</div>
                  </div>
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
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Actions</h3>
                <p className="text-gray-600">Manage user account settings and permissions</p>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="text-red-800 font-medium mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Danger Zone
                </h4>
                <p className="text-red-700 text-sm mb-4">
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete user "${user.userId || user.email}"? This action cannot be undone.`)) {
                      // TODO: Implement delete user functionality
                      console.log('Delete user:', user.id);
                      alert('Delete user functionality will be implemented when backend is ready.');
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete User Account
                </button>
              </div>
              
              {/* Future Actions Placeholder */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-gray-800 font-medium mb-4">Additional Actions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 opacity-50">
                    <div>
                      <p className="font-medium text-gray-500">Reset Password</p>
                      <p className="text-sm text-gray-400">Send password reset email to user</p>
                    </div>
                    <button disabled className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed">
                      Coming Soon
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 opacity-50">
                    <div>
                      <p className="font-medium text-gray-500">Suspend Account</p>
                      <p className="text-sm text-gray-400">Temporarily disable user access</p>
                    </div>
                    <button disabled className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed">
                      Coming Soon
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 opacity-50">
                    <div>
                      <p className="font-medium text-gray-500">Update Credits</p>
                      <p className="text-sm text-gray-400">Modify user's credit balance</p>
                    </div>
                    <button disabled className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
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
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💰</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {userCredits?.toLocaleString() || '0'} Credits
                    </h3>
                    <p className="text-gray-600">Current credit balance</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Credit Information</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>• Credits are used for API requests and services</p>
                      <p>• Account created: {formatDate(user.createdAt)}</p>
                      <p>• Last updated: {formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
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