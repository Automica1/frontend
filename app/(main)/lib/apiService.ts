// src/lib/apiService.ts
import { ApiResponse, QRExtractResponse, SignatureVerificationResponse, FaceDetectionResponse, FaceVerificationResponse, IdCropResponse } from '../types/api';
import { useCreditsStore } from '../stores/creditsStore';

// Extended response types that include credits
interface ApiResponseWithCredits extends ApiResponse {
  remainingCredits?: number;
  userId?: string;
}

interface QRExtractResponseWithCredits extends QRExtractResponse {
  remainingCredits?: number;
  userId?: string;
}

interface SignatureVerificationResponseWithCredits extends SignatureVerificationResponse {
  remaining_credits?: number;
  userId?: string;
}

interface FaceDetectionResponseWithCredits extends FaceDetectionResponse {
  remainingCredits?: number;
  userId?: string;
}

interface FaceVerificationResponseWithCredits extends FaceVerificationResponse {
  remainingCredits?: number;
  userId?: string;
}

interface IdCropResponseWithCredits extends IdCropResponse {
  remainingCredits: number;
  userId: string;
}

// API Key related interfaces
interface CreateApiKeyResponse {
  message: string;
  apiKey: string;
  keyName: string;
  keyPrefix: string;
  expiresAt: string;
  createdAt: string;
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
      
      const { accessToken, expiresIn } = await response.json();
      
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

  private generateReqId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to update credits after successful API calls
  private updateCreditsFromResponse(response: any) {
  // Check for both naming conventions: remainingCredits and remaining_credits
  const credits = response?.remainingCredits ?? response?.remaining_credits;
  
  if (response && typeof credits === 'number') {
    const { updateCredits } = useCreditsStore.getState();
    updateCredits(credits);
    console.log('Credits updated from API response:', credits);
  } else {
    console.log('No credits found in response:', response);
  }
}



  // Enhanced request method with better error handling
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    retryOnAuth = true
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      const token = await this.getAuthToken();
      
      // Log the request for debugging
      console.log(`Making request to: ${fullUrl}`);
      console.log('Request payload:', options.body);
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle auth errors with retry
      if (response.status === 401 && retryOnAuth) {
        console.log('Auth token expired, retrying...');
        this.clearAuth();
        return this.makeRequest<T>(endpoint, options, false);
      }

      // Enhanced error handling with more details
      if (!response.ok) {
        let errorData: any = {};
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            // If response is not JSON, get text content
            const textContent = await response.text();
            console.error('Non-JSON error response:', textContent);
            errorMessage = `${errorMessage} - ${textContent.slice(0, 200)}`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        // Log detailed error information
        console.error('API Error Details:', {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          errorData,
        });

        // Create enhanced error object
        const enhancedError = new Error(errorMessage);
        // Attach error data to the error object for access in useApi
        (enhancedError as any).errorData = errorData;

        throw enhancedError;
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      // Update credits if present in response
      this.updateCreditsFromResponse(result);
      
      return result;
      
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      
      // Network or other errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${this.baseUrl}. Please check if the server is running.`);
      }
      
      throw error;
    }
  }

// Credit operations
  async getCreditsBalance(): Promise<{ credits: number; userId: string }> {
    const response = await this.makeRequest<{ credits: number; userId: string }>('/credits/balance');
    // Update credits store with initial data
    const { setCredits } = useCreditsStore.getState();
    setCredits(response.credits, response.userId);
    
    return response;
  }

 // Token redemption
async redeemToken(token: string): Promise<{ 
  success: boolean; 
  message: string; 
  remainingCredits?: number; 
  userId?: string;
  creditsAdded?: number;
}> {
  // Validate token input
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('Invalid token provided');
  }

  const cleanToken = token.trim();
  
  // Basic token format validation (assuming hex format based on example)
  if (!/^[a-f0-9]{32}$/.test(cleanToken)) {
    throw new Error('Invalid token format. Token must be a 32-character hexadecimal string.');
  }

  console.log('Redeeming token:', cleanToken.slice(0, 8) + '...');
  
  // Backend returns different structure than expected
  const response = await this.makeRequest<{ 
    message: string; 
    credits: number;           // This is actually creditsAdded
    remainingCredits: number; 
    expiresAt?: string;
    usedAt?: string;
    description?: string;
  }>('/tokens/redeem', {
    method: 'POST',
    body: JSON.stringify({
      token: cleanToken,
    }),
  });

  // Transform backend response to match frontend expectations
  const transformedResponse = {
    success: true, // If we reach here without throwing, it was successful
    message: response.message,
    remainingCredits: response.remainingCredits,
    creditsAdded: response.credits, // Map credits to creditsAdded
    userId: undefined as string | undefined // Backend doesn't provide userId
  };

  // Update credits store if redemption was successful and credits are provided
  if (typeof response.remainingCredits === 'number') {
    const { setCredits } = useCreditsStore.getState();
    // Since we don't have userId from backend, use existing userId from store or empty string
    const { userId: currentUserId } = useCreditsStore.getState();
    setCredits(response.remainingCredits, currentUserId || '');
    console.log('Credits updated after token redemption:', response.remainingCredits);
  }

  return transformedResponse;
}

  // API Key Management
  async createApiKey(): Promise<CreateApiKeyResponse> {
    console.log('Creating API key with default settings...');
    
    const response = await this.makeRequest<CreateApiKeyResponse>('/api-keys', {
      method: 'POST',
      body: JSON.stringify({}), // Empty body since backend handles defaults
    });

    console.log('API key created successfully:', {
      keyName: response.keyName,
      keyPrefix: response.keyPrefix,
      expiresAt: response.expiresAt,
      createdAt: response.createdAt
    });

    return response;
  }

  // QR Code Masking
  async maskQRCode(base64Image: string): Promise<ApiResponseWithCredits> {
    const reqId = this.generateReqId('qr-mask');
    
    // Validate base64 input
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid base64 image data');
    }
    
    return this.makeRequest<ApiResponseWithCredits>('/qr-masking', {
      method: 'POST',
      body: JSON.stringify({
        req_id: reqId,
        base64_str: base64Image,
      }),
    });
  }

  // QR Code Extraction with enhanced error handling
  async extractQRCode(base64Image: string): Promise<QRExtractResponseWithCredits> {
    const reqId = this.generateReqId('qr-extract');
    
    // Validate input
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid base64 image data provided');
    }

    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Basic base64 validation
    try {
      atob(cleanBase64);
    } catch (e) {
      throw new Error('Invalid base64 format');
    }
    
    console.log('Sending QR extraction request with:', {
      req_id: reqId,
      base64_length: cleanBase64.length,
      base64_sample: cleanBase64.slice(0, 50) + '...'
    });
    
    return this.makeRequest<QRExtractResponseWithCredits>('/qr-extraction', {
      method: 'POST',
      body: JSON.stringify({
        req_id: reqId,
        doc_base64: cleanBase64,
      }),
    });
  }

  // ID Cropping with validation
  async processIdCrop(base64Image: string): Promise<IdCropResponseWithCredits> {
    const reqId = this.generateReqId('id-crop');
    
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid base64 image data');
    }

    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    return this.makeRequest<IdCropResponseWithCredits>('/id-cropping', {
      method: 'POST',
      body: JSON.stringify({
        req_id: reqId,
        doc_base64: cleanBase64,
      }),
    });
  }

  // Signature verification with enhanced validation
  async verifySignatures(base64Images: string[]): Promise<SignatureVerificationResponseWithCredits> {
    if (!Array.isArray(base64Images) || base64Images.length !== 2) {
      throw new Error('Signature verification requires exactly 2 images');
    }

    // Validate each image
    const cleanImages = base64Images.map((img, index) => {
      if (!img || typeof img !== 'string') {
        throw new Error(`Invalid base64 data for image ${index + 1}`);
      }
      return img.replace(/^data:image\/[a-z]+;base64,/, '');
    });

    const reqId = this.generateReqId('sig-verify');
    
    return this.makeRequest<SignatureVerificationResponseWithCredits>('/signature-verification', {
      method: 'POST',
      body: JSON.stringify({
        req_id: reqId,
        doc_base64: cleanImages,
      }),
    });
  }

  // Face Detection with validation
  async detectFace(base64Image: string): Promise<FaceDetectionResponseWithCredits> {
    const reqId = this.generateReqId('face-cropping');
    
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid base64 image data');
    }

    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    return this.makeRequest<FaceDetectionResponseWithCredits>('/face-detect', {
      method: 'POST',
      body: JSON.stringify({
        req_id: reqId,
        doc_base64: cleanBase64,
      }),
    });
  }

  // Face Verification with validation
  async verifyFace(base64Image1: string, base64Image2: string): Promise<FaceVerificationResponseWithCredits> {
    const reqId = this.generateReqId('face-verify');
    
    if (!base64Image1 || !base64Image2) {
      throw new Error('Both images are required for face verification');
    }

    const cleanBase64_1 = base64Image1.replace(/^data:image\/[a-z]+;base64,/, '');
    const cleanBase64_2 = base64Image2.replace(/^data:image\/[a-z]+;base64,/, '');
    
    return this.makeRequest<FaceVerificationResponseWithCredits>('/face-verification', {
      method: 'POST',
      body: JSON.stringify({
        req_id: reqId,
        doc_base64_1: cleanBase64_1,
        doc_base64_2: cleanBase64_2,
        doc_type: "face",
      }),
    });
  }

  // Legacy methods for backward compatibility
  // async cropFace(base64Image: string): Promise<FaceDetectionResponseWithCredits> {
  //   return this.detectFace(base64Image);
  // }

  // Health check with timeout
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const result = await this.makeRequest<{ status: string; timestamp: string }>('/health', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Health check timeout - server may be down');
      }
      throw error;
    }
  }

  // Test connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;