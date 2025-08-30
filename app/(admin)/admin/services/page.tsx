"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Users, 
  Server, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Key,
  Globe,
  AlertCircle
} from 'lucide-react';

// Import the API service and types
import { 
  apiService,
  type GlobalUsageStatsResponse,
  type UserUsageStatsResponse,
  type ServiceUserStatsResponse,
  type UsageHistoryResponse,
  type UsageQueryParams
} from '../../lib/apiService';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

interface AnalyticsData {
  globalStats: GlobalUsageStatsResponse;
  userStats: UserUsageStatsResponse;
  serviceStats: ServiceUserStatsResponse;
}

const UsageAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('allTime');
  const [selectedService, setSelectedService] = useState('');
  const [serviceHistory, setServiceHistory] = useState<UsageHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const datePresets = apiService.getDateRangePresets();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: UsageQueryParams = {};
      
      // Add date range parameters if not 'allTime'
      if (dateRange !== 'allTime' && datePresets[dateRange]) {
        params.start_date = datePresets[dateRange].start_date;
        params.end_date = datePresets[dateRange].end_date;
      }
      
      const data = await apiService.getUsageAnalytics(params);
      setAnalytics(data);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
      
      // Auto-retry logic for transient failures
      if (retryCount < 3 && errorMessage.includes('Authentication')) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchAnalytics();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceHistory = async (serviceName: string) => {
    if (!serviceName) return;
    
    try {
      setHistoryLoading(true);
      
      const params: UsageQueryParams = { limit: 50, skip: 0 };
      
      // Add date range parameters if not 'allTime'
      if (dateRange !== 'allTime' && datePresets[dateRange]) {
        params.start_date = datePresets[dateRange].start_date;
        params.end_date = datePresets[dateRange].end_date;
      }
      
      const history = await apiService.getServiceUsageHistory(serviceName, params);
      setServiceHistory(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service history';
      console.error('Error fetching service history:', err);
      // You might want to show a toast notification here
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchServiceHistory(selectedService);
    } else {
      setServiceHistory(null);
    }
  }, [selectedService, dateRange]);

  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    setActiveTab('history');
  };

  const handleExportData = () => {
    if (!analytics || !analytics.globalStats.stats) return;
    
    // Create CSV data
    const csvData = analytics.globalStats.stats.map(stat => ({
      service: apiService.formatServiceName(stat.service_name),
      total_calls: stat.total_calls,
      success_calls: stat.success_calls,
      failed_calls: stat.failed_calls,
      success_rate: apiService.calculateSuccessRate(stat.success_calls, stat.total_calls),
      total_credits: stat.total_credits
    }));
    
    const csvContent = [
      ['Service', 'Total Calls', 'Success Calls', 'Failed Calls', 'Success Rate (%)', 'Credits Used'],
      ...csvData.map(row => [row.service, row.total_calls, row.success_calls, row.failed_calls, row.success_rate, row.total_credits])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAuthMethodIcon = (authMethod: string) => {
    switch (authMethod.toLowerCase()) {
      case 'bearer_token':
      case 'api_key':
        return <Key className="h-3 w-3" />;
      case 'browser':
      case 'session':
        return <Globe className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getAuthMethodLabel = (authMethod: string) => {
    switch (authMethod.toLowerCase()) {
      case 'bearer_token':
        return 'API Key';
      case 'browser':
      case 'session':
        return 'Browser';
      default:
        return authMethod.charAt(0).toUpperCase() + authMethod.slice(1);
    }
  };

  const getAuthMethodColor = (authMethod: string) => {
    switch (authMethod.toLowerCase()) {
      case 'bearer_token':
      case 'api_key':
        return 'bg-blue-100 text-blue-800';
      case 'browser':
      case 'session':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
            {retryCount > 0 && (
              <span className="text-sm text-gray-500">
                Retry attempt: {retryCount}/3
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  // Safe data extraction with null checks
  const globalStats = analytics.globalStats?.stats || [];
  const userStats = analytics.userStats?.stats || [];
  const totalServices = analytics.globalStats?.total_services || 0;
  const totalUsers = analytics.userStats?.total_users || 0;

  const totalStats = globalStats.reduce(
    (acc, stat) => ({
      totalCalls: acc.totalCalls + stat.total_calls,
      successCalls: acc.successCalls + stat.success_calls,
      failedCalls: acc.failedCalls + stat.failed_calls,
      totalCredits: acc.totalCredits + stat.total_credits,
    }),
    { totalCalls: 0, successCalls: 0, failedCalls: 0, totalCredits: 0 }
  );

  const successRate = apiService.calculateSuccessRate(totalStats.successCalls, totalStats.totalCalls);

  const chartData = globalStats.map(stat => ({
    name: apiService.formatServiceName(stat.service_name),
    calls: stat.total_calls,
    success: stat.success_calls,
    failed: stat.failed_calls,
    credits: stat.total_credits,
    successRate: apiService.calculateSuccessRate(stat.success_calls, stat.total_calls)
  }));

  const pieData = globalStats.map((stat, index) => ({
    name: apiService.formatServiceName(stat.service_name),
    value: stat.total_calls,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const filteredHistory = serviceHistory?.usage_history?.filter(record => 
    !searchTerm || 
    record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAuthMethodLabel(record.auth_method).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDateRange = () => {
    if (dateRange === 'allTime') return 'All Time';
    if (analytics.globalStats?.date_range?.start_date && analytics.globalStats?.date_range?.end_date) {
      const start = apiService.formatDate(analytics.globalStats.date_range.start_date);
      const end = apiService.formatDate(analytics.globalStats.date_range.end_date);
      return `${start} - ${end}`;
    }
    return dateRange.charAt(0).toUpperCase() + dateRange.slice(1);
  };

  const hasNoData = globalStats.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage Analytics</h1>
              <p className="text-gray-600 mb-2">Monitor service usage, performance, and user activity</p>
              <p className="text-sm text-gray-500">Period: {formatDateRange()}</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="allTime">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7Days">Last 7 Days</option>
                <option value="last30Days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
              <button
                onClick={handleExportData}
                disabled={hasNoData}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && analytics && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Warning: {error}. Showing cached data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Data Banner */}
        {hasNoData && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">No Data Available</h3>
                <p className="text-sm text-blue-700 mt-1">
                  No usage data found for the selected period. This might be because:
                </p>
                <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                  <li>The API tracking was implemented recently and doesn't have historical data</li>
                  <li>No API calls were made during this time period</li>
                  <li>The selected date range is before data collection began</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  Try selecting "All Time" or a more recent date range to see available data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalCalls.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalStats.successCalls} success, {totalStats.failedCalls} failed
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalStats.totalCalls > 0 ? 'Based on all requests' : 'No data available'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits Used</p>
                <p className="text-2xl font-bold text-purple-600">{totalStats.totalCredits.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all services
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-orange-600">{totalServices}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalUsers} active users
                </p>
              </div>
              <Server className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'services', label: 'Services' },
              { id: 'users', label: 'Users' },
              { id: 'history', label: 'Usage History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Usage Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Usage Overview</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100} 
                      fontSize={12} 
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" fill="#3B82F6" name="Total Calls" />
                    <Bar dataKey="credits" fill="#10B981" name="Credits Used" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No usage data available for the selected period</p>
                    <p className="text-gray-400 text-sm mt-1">Try selecting a different date range</p>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No usage data available for the selected period</p>
                    <p className="text-gray-400 text-sm mt-1">Try selecting a different date range</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Service Performance</h3>
            </div>
            {globalStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {globalStats.map((service, index) => {
                      const serviceSuccessRate = apiService.calculateSuccessRate(service.success_calls, service.total_calls);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {apiService.formatServiceName(service.service_name)}
                            </div>
                            <div className="text-sm text-gray-500">{service.service_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.total_calls.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              serviceSuccessRate === 100
                                ? 'bg-green-100 text-green-800'
                                : serviceSuccessRate >= 95
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {serviceSuccessRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.total_credits.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleServiceSelect(service.service_name)}
                              className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View History
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No service data available for the selected period</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different date range or check back later</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
            </div>
            {userStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Used</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userStats.map((user, index) => {
                      const userSuccessRate = apiService.calculateSuccessRate(user.success_calls, user.total_calls);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.user_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.total_calls.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {userSuccessRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.total_credits.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No user activity data available for the selected period</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different date range or check back later</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Usage History {selectedService && `- ${apiService.formatServiceName(selectedService)}`}
                </h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Service</option>
                    {globalStats.map((service) => (
                      <option key={service.service_name} value={service.service_name}>
                        {apiService.formatServiceName(service.service_name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-3" />
                <span>Loading history...</span>
              </div>
            ) : selectedService && serviceHistory ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistory.length > 0 ? filteredHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{apiService.formatDate(record.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.email}</div>
                          <div className="text-sm text-gray-500 truncate max-w-32" title={record.user_id}>
                            {record.user_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.endpoint}</div>
                          <div className="text-sm text-gray-500">{record.method}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAuthMethodColor(record.auth_method)}`}>
                            {getAuthMethodIcon(record.auth_method)}
                            <span className="ml-1">{getAuthMethodLabel(record.auth_method)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.success ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {record.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.credits_used}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`${record.process_time_ms > 5000 ? 'text-red-600' : record.process_time_ms > 2000 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {record.process_time_ms}ms
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            {searchTerm ? 'No records match your search criteria' : 'No usage history available for this service'}
                          </p>
                          {!searchTerm && selectedService && (
                            <p className="text-gray-400 text-sm mt-1">
                              This might be because the service hasn't been used in the selected time period
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Pagination Info */}
                {serviceHistory && serviceHistory.usage_history && serviceHistory.usage_history.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        Showing {serviceHistory.pagination.skip + 1} to {' '}
                        {Math.min(serviceHistory.pagination.skip + serviceHistory.pagination.limit, serviceHistory.total_records)} of{' '}
                        {serviceHistory.total_records} records
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (serviceHistory.pagination.skip > 0) {
                              // Implement pagination logic here
                              console.log('Previous page');
                            }
                          }}
                          disabled={serviceHistory.pagination.skip === 0}
                          className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => {
                            if (serviceHistory.pagination.skip + serviceHistory.pagination.limit < serviceHistory.total_records) {
                              // Implement pagination logic here
                              console.log('Next page');
                            }
                          }}
                          disabled={serviceHistory.pagination.skip + serviceHistory.pagination.limit >= serviceHistory.total_records}
                          className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div>
                  <p className="text-gray-500">
                    {globalStats.length === 0 
                      ? 'No services available for the selected period'
                      : 'Select a service to view its usage history'
                    }
                  </p>
                  {globalStats.length === 0 && (
                    <p className="text-gray-400 text-sm mt-2">
                      Try selecting "All Time" or a different date range to see available services
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageAnalyticsPage;