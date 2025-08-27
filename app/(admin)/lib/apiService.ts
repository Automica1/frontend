// Types for better type safety
interface TokenGenerateRequest {
  credits: number;
  description: string;
}

interface TokenGenerateResponse {
  message: string;
  token: string;
  credits: number;
  expiresAt: string;
  description: string;
}

interface TokenDeleteResponse {
  message: string;
  tokenId: string;
}

interface TokenInfo {
  id: string;
  token: string;
  credits: number;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  description: string;
}

interface TokenListResponse {
  message: string;
  count?: number;
  tokens: TokenInfo[];
}

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
}

// User management types
interface UserInfo {
  id: string;
  userId: string;  // Add this field - the actual unique identifier
  email: string;
  name?: string;   // Make optional since it might not always be present
  role?: string;   // Make optional since your API doesn't always return this
  credits: number;
  isActive?: boolean;  // Make optional with default handling
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface UserListResponse {
  message: string;
  count?: number;
  users: UserInfo[];
}

interface UserDetailsResponse {
  message: string;
  user: UserInfo;
}

interface UserStatsResponse {
  message: string;
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalCredits: number;
    averageCreditsPerUser: number;
    newUsersThisMonth: number;
    adminUsers: number;
    regularUsers: number;
  };
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface UserActivityResponse {
  message: string;
  count?: number;
  activities: UserActivity[];
}

interface UserCreditsResponse {
  message: string;
  userId: string;
  credits: number;
  lastUpdated: string;
}

// Usage tracking types
interface DateRange {
  start_date: string | null;
  end_date: string | null;
}

interface ServiceUsageStat {
  service_name: string;
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  total_credits: number;
}

interface GlobalUsageStatsResponse {
  date_range: DateRange;
  stats: ServiceUsageStat[];
  total_services: number;
}

interface UserUsageStat {
  user_id: string;
  email: string;
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  total_credits: number;
}

interface UserUsageStatsResponse {
  date_range: DateRange;
  stats: UserUsageStat[];
  total_users: number;
}

interface ServiceUserStat {
  user_id: string;
  email: string;
  service_name: string;
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  total_credits: number;
  last_used: string;
}

interface ServiceUserStatsResponse {
  date_range: DateRange;
  service: string;
  stats: ServiceUserStat[];
  total_records: number;
}

interface UsageHistoryRecord {
  id: string;
  user_id: string;
  email: string;
  service_name: string;
  endpoint: string;
  method: string;
  success: boolean;
  credits_used: number;
  ip_address: string;
  user_agent: string;
  auth_method: string;
  process_time_ms: number;
  created_at: string;
}

interface PaginationParams {
  limit: number;
  skip: number;
}

interface UsageHistoryResponse {
  pagination: PaginationParams;
  service_name: string;
  total_records: number;
  usage_history: UsageHistoryRecord[] | null;
}

// Query parameters interface for usage endpoints
interface UsageQueryParams {
  start_date?: string;
  end_date?: string;
  service?: string;
  limit?: number;
  skip?: number;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api/v1';
  }

  // Token management with caching and refresh
  private async getAuthToken(): Promise<string> {
    // Check if token is still valid (with 5min buffer)
    if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.authToken;
    }

    try {
      const response = await fetch('/api/auth', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }
      
      const { accessToken, expiresIn }: AuthResponse = await response.json();
      
      // Cache the token
      this.authToken = accessToken;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      
      return accessToken;
    } catch (error) {
      this.clearAuth();
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  private clearAuth() {
    this.authToken = null;
    this.tokenExpiry = null;
  }

  // Helper method to build query string
  private buildQueryString(params: Record<string, any>): string {
    const filteredParams = Object.entries(params).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    );
    
    if (filteredParams.length === 0) return '';
    
    const queryString = filteredParams
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `?${queryString}`;
  }

  // Generic API request handler
  private async makeAuthenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const authToken = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Authentication expired. Please log in again.');
      }
      
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // Token Management Methods

  /**
   * Generate a new token (Admin Only)
   * @param credits Number of credits for the token
   * @param description Description for the token
   */
  async generateToken(credits: number, description: string): Promise<TokenGenerateResponse> {
    const payload: TokenGenerateRequest = { credits, description };
    
    return this.makeAuthenticatedRequest<TokenGenerateResponse>(
      '/tokens/generate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * Delete a token (Admin Only)
   * @param tokenId The ID of the token to delete
   */
  async deleteToken(tokenId: string): Promise<TokenDeleteResponse> {
    return this.makeAuthenticatedRequest<TokenDeleteResponse>(
      `/tokens/${tokenId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Get tokens created by the current admin user
   */
  async getMyTokens(): Promise<TokenListResponse> {
    return this.makeAuthenticatedRequest<TokenListResponse>('/tokens/my-tokens');
  }

  /**
   * Get all tokens in the system (Admin Only)
   */
  async getAllTokens(): Promise<TokenListResponse> {
    return this.makeAuthenticatedRequest<TokenListResponse>('/tokens/all');
  }

  /**
   * Get all used tokens (Admin Only)
   */
  async getUsedTokens(): Promise<TokenListResponse> {
    return this.makeAuthenticatedRequest<TokenListResponse>('/tokens/used');
  }

  /**
   * Get all unused tokens (Admin Only)
   */
  async getUnusedTokens(): Promise<TokenListResponse> {
    return this.makeAuthenticatedRequest<TokenListResponse>('/tokens/unused');
  }

  // User Management Methods (Admin Only)

  /**
   * Get all users in the system (Admin Only)
   */
  async getAllUsers(): Promise<UserListResponse> {
    return this.makeAuthenticatedRequest<UserListResponse>('/admin/users');
  }

  /**
   * Get user details by ID (Admin Only)
   * @param userId The ID of the user to retrieve
   */
  async getUserById(userId: string): Promise<UserDetailsResponse> {
    return this.makeAuthenticatedRequest<UserDetailsResponse>(`/admin/users/${userId}`);
  }

  /**
   * Get aggregated user statistics (Admin Only)
   */
  async getUserStats(): Promise<UserStatsResponse> {
    return this.makeAuthenticatedRequest<UserStatsResponse>('/admin/users/stats');
  }

  /**
   * Get activity history for a specific user (Admin Only)
   * @param userId The ID of the user whose activity to retrieve
   */
  async getUserActivity(userId: string): Promise<UserActivityResponse> {
    return this.makeAuthenticatedRequest<UserActivityResponse>(`/admin/users/${userId}/activity`);
  }

  /**
   * Get credit balance for a specific user (Admin Only)
   * @param userId The ID of the user whose credits to retrieve
   */
  async getUserCredits(userId: string): Promise<UserCreditsResponse> {
    return this.makeAuthenticatedRequest<UserCreditsResponse>(`/admin/users/${userId}/credits`);
  }

  // Usage Tracking Methods (Admin Only)

  /**
   * Get global service usage statistics (Admin Only)
   * @param params Query parameters for filtering by date range
   */
  async getGlobalUsageStats(params?: UsageQueryParams): Promise<GlobalUsageStatsResponse> {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.makeAuthenticatedRequest<GlobalUsageStatsResponse>(`/admin/usage/global${queryString}`);
  }

  /**
   * Get per-user usage statistics (Admin Only)
   * @param params Query parameters for filtering by date range
   */
  async getUserUsageStats(params?: UsageQueryParams): Promise<UserUsageStatsResponse> {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.makeAuthenticatedRequest<UserUsageStatsResponse>(`/admin/usage/users${queryString}`);
  }

  /**
   * Get service-specific user statistics (Admin Only)
   * @param params Query parameters for filtering by service and date range
   */
  async getServiceUserStats(params?: UsageQueryParams): Promise<ServiceUserStatsResponse> {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.makeAuthenticatedRequest<ServiceUserStatsResponse>(`/admin/usage/services${queryString}`);
  }

  /**
   * Get individual user's usage history (Admin Only)
   * @param userId The ID of the user whose usage history to retrieve
   * @param params Query parameters for pagination
   */
  async getUserUsageHistory(userId: string, params?: UsageQueryParams): Promise<UsageHistoryResponse> {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.makeAuthenticatedRequest<UsageHistoryResponse>(`/admin/usage/user/${userId}/history${queryString}`);
  }

  /**
   * Get service-specific usage history (Admin Only)
   * @param serviceName The name of the service whose usage history to retrieve
   * @param params Query parameters for pagination
   */
  async getServiceUsageHistory(serviceName: string, params?: UsageQueryParams): Promise<UsageHistoryResponse> {
    const queryString = params ? this.buildQueryString(params) : '';
    return this.makeAuthenticatedRequest<UsageHistoryResponse>(`/admin/usage/service/${serviceName}/history${queryString}`);
  }

  // Utility methods for better UX

  /**
   * Check if current user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiry(): number | null {
    return this.tokenExpiry;
  }

  /**
   * Force token refresh on next request
   */
  refreshAuth(): void {
    this.clearAuth();
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<{
    total: number;
    used: number;
    unused: number;
    myTokens: number;
  }> {
    try {
      const [allTokens, usedTokens, unusedTokens, myTokens] = await Promise.all([
        this.getAllTokens(),
        this.getUsedTokens(),
        this.getUnusedTokens(),
        this.getMyTokens(),
      ]);

      return {
        total: allTokens.count || allTokens.tokens.length,
        used: usedTokens.count || usedTokens.tokens.length,
        unused: unusedTokens.count || unusedTokens.tokens.length,
        myTokens: myTokens.count || myTokens.tokens.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch token statistics: ${error}`);
    }
  }

  /**
   * Get comprehensive dashboard stats (Admin Only)
   */
  async getDashboardStats(): Promise<{
    tokenStats: {
      total: number;
      used: number;
      unused: number;
      myTokens: number;
    };
    userStats: UserStatsResponse['stats'];
  }> {
    try {
      const [tokenStats, userStatsResponse] = await Promise.all([
        this.getTokenStats(),
        this.getUserStats(),
      ]);

      return {
        tokenStats,
        userStats: userStatsResponse.stats,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard statistics: ${error}`);
    }
  }

  /**
   * Get comprehensive usage analytics (Admin Only)
   */
  async getUsageAnalytics(params?: UsageQueryParams): Promise<{
    globalStats: GlobalUsageStatsResponse;
    userStats: UserUsageStatsResponse;
    serviceStats: ServiceUserStatsResponse;
  }> {
    try {
      const [globalStats, userStats, serviceStats] = await Promise.all([
        this.getGlobalUsageStats(params),
        this.getUserUsageStats(params),
        this.getServiceUserStats(params),
      ]);

      return {
        globalStats,
        userStats,
        serviceStats,
      };
    } catch (error) {
      throw new Error(`Failed to fetch usage analytics: ${error}`);
    }
  }

  /**
   * Get top services by usage (Admin Only)
   */
  async getTopServicesByUsage(params?: UsageQueryParams): Promise<ServiceUsageStat[]> {
    try {
      const globalStats = await this.getGlobalUsageStats(params);
      return globalStats.stats.sort((a, b) => b.total_calls - a.total_calls);
    } catch (error) {
      throw new Error(`Failed to fetch top services: ${error}`);
    }
  }

  /**
   * Get top users by usage (Admin Only)
   */
  async getTopUsersByUsage(params?: UsageQueryParams): Promise<UserUsageStat[]> {
    try {
      const userStats = await this.getUserUsageStats(params);
      return userStats.stats.sort((a, b) => b.total_calls - a.total_calls);
    } catch (error) {
      throw new Error(`Failed to fetch top users: ${error}`);
    }
  }

  /**
   * Validate token format (client-side validation)
   */
  isValidTokenFormat(token: string): boolean {
    return /^TK_[a-zA-Z0-9]{33}$/.test(token);
  }

  /**
   * Format token for display (show only first and last few characters)
   */
  formatTokenForDisplay(token: string): string {
    if (!token || token.length < 10) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 6)}`;
  }

  /**
   * Calculate days until token expires
   */
  getDaysUntilExpiry(expiresAt: string): number {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  /**
   * Format user role for display
   */
  formatUserRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  /**
   * Check if user is active based on last login
   */
  isUserRecentlyActive(lastLoginAt?: string): boolean {
    if (!lastLoginAt) return false;
    const lastLogin = new Date(lastLoginAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastLogin > thirtyDaysAgo;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format date for API query parameters (YYYY-MM-DD)
   */
  formatDateForQuery(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate success rate percentage
   */
  calculateSuccessRate(successCalls: number, totalCalls: number): number {
    if (totalCalls === 0) return 0;
    return Math.round((successCalls / totalCalls) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format service name for display
   */
  formatServiceName(serviceName: string): string {
    return serviceName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get date range presets for quick filtering
   */
  getDateRangePresets(): Record<string, { start_date: string; end_date: string }> {
    const now = new Date();
    const today = this.formatDateForQuery(now);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);
    
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      today: {
        start_date: today,
        end_date: today
      },
      yesterday: {
        start_date: this.formatDateForQuery(yesterday),
        end_date: this.formatDateForQuery(yesterday)
      },
      last7Days: {
        start_date: this.formatDateForQuery(last7Days),
        end_date: today
      },
      last30Days: {
        start_date: this.formatDateForQuery(last30Days),
        end_date: today
      },
      thisMonth: {
        start_date: this.formatDateForQuery(thisMonth),
        end_date: today
      },
      lastMonth: {
        start_date: this.formatDateForQuery(lastMonth),
        end_date: this.formatDateForQuery(lastMonthEnd)
      }
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type { 
  TokenGenerateRequest, 
  TokenGenerateResponse, 
  TokenDeleteResponse,
  TokenInfo, 
  TokenListResponse,
  UserInfo,
  UserListResponse,
  UserDetailsResponse,
  UserStatsResponse,
  UserActivity,
  UserActivityResponse,
  UserCreditsResponse,
  // Usage tracking types
  DateRange,
  ServiceUsageStat,
  GlobalUsageStatsResponse,
  UserUsageStat,
  UserUsageStatsResponse,
  ServiceUserStat,
  ServiceUserStatsResponse,
  UsageHistoryRecord,
  PaginationParams,
  UsageHistoryResponse,
  UsageQueryParams
};