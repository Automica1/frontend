'use client';

import { useEffect, useState } from "react";
import { apiService } from "../lib/apiService";

interface ServiceUsageStat {
  service_name: string;
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  total_credits: number;
}

interface GlobalUsageStatsResponse {
  date_range: {
    start_date: string | null;
    end_date: string | null;
  };
  stats: ServiceUsageStat[];
  total_services: number;
}

interface AdminDashboardProps {
  initialUser: any; // Pass user data from server component
  initialRoles: any; // Pass roles data from server component
}

export default function AdminDashboard({ initialUser, initialRoles }: AdminDashboardProps) {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [mostUsedService, setMostUsedService] = useState<string>('--');
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Starting API call to fetch users...");
        const usersData = await apiService.getAllUsers();
        console.log("Users data received:", usersData);
        
        setTotalUsers(usersData.count || usersData.users?.length || 0);
      } catch (error) {
        console.error("Detailed error:", error);
        setError(`Failed to load user count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTotalUsers(0);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchGlobalUsageStats() {
      try {
        setIsStatsLoading(true);
        setStatsError(null);
        
        console.log("Starting API call to fetch global usage stats...");
        const statsData: GlobalUsageStatsResponse = await apiService.getGlobalUsageStats();
        console.log("Global usage stats received:", statsData);
        
        // Find the most used service by total calls
        if (statsData.stats && statsData.stats.length > 0) {
          const mostUsed = statsData.stats.reduce((prev, current) => {
            return (prev.total_calls > current.total_calls) ? prev : current;
          });
          
          // Format the service name to be more readable
          const formattedName = mostUsed.service_name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setMostUsedService(`${formattedName} (${mostUsed.total_calls} calls)`);
        } else {
          setMostUsedService('No data');
        }
      } catch (error) {
        console.error("Error fetching global usage stats:", error);
        setStatsError(`Failed to load usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setMostUsedService('Error');
      } finally {
        setIsStatsLoading(false);
      }
    }

    fetchUserCount();
    fetchGlobalUsageStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Hello {initialUser?.given_name || initialUser?.email}! You have admin access to this system.
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{initialUser?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">
              {initialUser?.given_name} {initialUser?.family_name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <p className="mt-1 text-sm text-gray-900">{initialUser?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Roles</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {initialRoles?.map((role: any) => (
                <span
                  key={role.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <div className="text-2xl font-semibold text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : error ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  totalUsers
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Most Used Service</p>
              <div className="text-lg font-semibold text-gray-900">
                {isStatsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                ) : statsError ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : (
                  <span className="text-sm">{mostUsedService}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Issues</p>
              <p className="text-2xl font-semibold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500 text-sm">No recent activity to display.</p>
      </div>

      {/* Error Display */}
      {(error || statsError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                {error && <p>Users: {error}</p>}
                {statsError && <p>Usage Stats: {statsError}</p>}
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}