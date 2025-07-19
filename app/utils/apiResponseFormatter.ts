// utils/apiResponseFormatter.ts
import { SolutionType } from '../(main)/types/solution';

export const formatApiResponse = (responseData: any, solutionType: SolutionType): string => {
  if (!responseData) return '';
  
  // For face verification, show only faceResult
  if (solutionType === 'face-verify' && responseData.faceResult && typeof responseData.faceResult === 'object') {
    return JSON.stringify(responseData.faceResult, null, 2);
  }
  
  if (solutionType === 'face-cropping' && responseData.faceResult && typeof responseData.faceResult === 'object') {
    return JSON.stringify(responseData.faceResult, null, 2);
  }

  if (solutionType === 'qr-extract' && responseData.qrResult && typeof responseData.qrResult === 'object') {
    return JSON.stringify(responseData.qrResult, null, 2);
  }

  // For signature verification, show only verification_result
  if (solutionType === 'signature-verification' && responseData.verification_result && typeof responseData.verification_result === 'object') {
    return JSON.stringify(responseData.verification_result, null, 2);
  }
  
  // For qr-mask, show only qrResult
  if (solutionType === 'qr-mask' && responseData.qrResult && typeof responseData.qrResult === 'object') {
    return JSON.stringify(responseData.qrResult, null, 2);
  }
  
  // Extract only the cropResult object if it exists
  if (responseData.cropResult && typeof responseData.cropResult === 'object') {
    const cropResult = {
      req_id: responseData.cropResult.req_id,
      success: responseData.cropResult.success,
      status: responseData.cropResult.status,
      result: responseData.cropResult.result,
      message: responseData.cropResult.message
    };
    return JSON.stringify(cropResult, null, 2);
  }
  
  // Fallback to full response if cropResult doesn't exist
  return JSON.stringify(responseData, null, 2);
};