// src/types/api.ts
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  processing_time?: string;
  req_id?: string;
  remainingCredits?: number;
}

export interface QRExtractResponse extends ApiResponse {
  data?: {
    qrResult?: {
      masked_base64: string;
      qr_codes: Array<{
        data: string;
        position: { x: number; y: number; width: number; height: number };
      }>;
    };
    masked_base64?: string;
    processing_time: string;
    file_name: string;
    file_size: string;
  };
}

export interface SignatureVerificationResponse extends ApiResponse {
  data?: {
    similarity_score: number;
    is_match: boolean;
    confidence: number;
    processing_time: string;
    file_names: string[];
    file_sizes: string[];
  };
}

export interface IdCropResponse {
  message: string;
  userId: string;
  remainingCredits: number;
  cropResult: {
    req_id: string;
    success: boolean;
    status: string;
    result: string;
    message: string;
  };
  processedAt: string;
}

// If you want to make it more specific, you could also define:
export interface CropResult {
  req_id: string;
  success: boolean;
  status: 'completed' | 'processing' | 'failed'; // assuming these are the possible statuses
  result: string; // This appears to be base64 encoded cropped image
  message: string;
}

export interface IdCropResponse {
  message: string;
  userId: string;
  remainingCredits: number;
  cropResult: CropResult;
  processedAt: string; // ISO 8601 date string
}