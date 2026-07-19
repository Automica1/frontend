// utils/solutionHelpers.ts
import { SolutionType } from '../(main)/types/solution';

const IMAGE_OUTPUT_SOLUTIONS: SolutionType[] = [
  'id-crop',
  'document-enhancement',
  'face-cropping',
  'qr-mask',
];

export const isImageOutputSolution = (solutionType: SolutionType): boolean =>
  IMAGE_OUTPUT_SOLUTIONS.includes(solutionType);

export const extractProcessedImageBase64 = (
  solutionType: SolutionType,
  data: unknown
): string | undefined => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const payload = data as Record<string, unknown>;

  if (solutionType === 'face-verify' || solutionType === 'face-cropping') {
    const faceResult = payload.faceResult as Record<string, unknown> | undefined;
    if (faceResult && Array.isArray(faceResult.data) && typeof faceResult.data[0] === 'string') {
      return faceResult.data[0];
    }
    if (typeof payload.processed_image === 'string') return payload.processed_image;
    if (typeof payload.result_image === 'string') return payload.result_image;
    if (typeof payload.cropped_face === 'string') return payload.cropped_face;
    return undefined;
  }

  if (solutionType === 'qr-extract') {
    return typeof payload.masked_base64 === 'string' ? payload.masked_base64 : undefined;
  }

  if (solutionType === 'qr-mask') {
    const qrResult = payload.qrResult as Record<string, unknown> | undefined;
    if (qrResult && typeof qrResult.masked_base64 === 'string') {
      return qrResult.masked_base64;
    }
    if (typeof payload.masked_base64 === 'string') return payload.masked_base64;
    if (typeof payload.result === 'string') return payload.result;
    if (typeof payload.processed_image === 'string') return payload.processed_image;
    return undefined;
  }

  if (solutionType === 'id-crop') {
    const cropResult = payload.cropResult as Record<string, unknown> | undefined;
    if (cropResult && typeof cropResult.result === 'string' && cropResult.result.length > 0) {
      return cropResult.result;
    }
    if (typeof payload.result === 'string') return payload.result;
    if (typeof payload.processed_image === 'string') return payload.processed_image;
    return undefined;
  }

  if (solutionType === 'document-enhancement') {
    const enhanceResult = payload.enhanceResult as Record<string, unknown> | undefined;
    if (enhanceResult && typeof enhanceResult.result === 'string' && enhanceResult.result.length > 0) {
      return enhanceResult.result;
    }
    if (typeof payload.result === 'string') return payload.result;
    return undefined;
  }

  if (typeof payload.processed_image === 'string') return payload.processed_image;
  if (typeof payload.result_image === 'string') return payload.result_image;
  if (typeof payload.masked_base64 === 'string') return payload.masked_base64;

  return undefined;
};

export const getFileRequirementText = (solutionType: SolutionType): string => {
  switch (solutionType) {
    case 'signature-verification':
      return 'Upload exactly 2 signature images for comparison';
    case 'qr-extract':
      return 'Upload an image containing QR codes';
    case 'id-crop':
      return 'Upload an ID document image';
    case 'document-enhancement':
      return 'Upload a signature crop or document scan to enhance';
    case 'ocr':
      return 'Upload a PDF or document image to extract text';
    case 'face-verify':
      return 'Upload an image for face verification';
    case 'face-cropping':
      return 'Upload an image for face cropping';
    default:
      return 'Upload an image to process';
  }
};

export const getProcessingMessage = (solutionType: SolutionType): string => {
  switch (solutionType) {
    case 'signature-verification':
      return 'Analyzing signatures...';
    case 'qr-extract':
      return 'Extracting QR codes...';
    case 'id-crop':
      return 'Processing ID document...';
    case 'document-enhancement':
      return 'Enhancing image...';
    case 'ocr':
      return 'Extracting text...';
    case 'face-verify':
      return 'Verifying face...';
    case 'face-cropping':
      return 'Cropping face...';
    default:
      return 'Processing your request...';
  }
};

export const getButtonText = (solutionType: SolutionType): string => {
  switch (solutionType) {
    case 'signature-verification':
      return 'Verify Signatures';
    case 'qr-extract':
      return 'Extract QR Codes';
    case 'id-crop':
      return 'Crop ID';
    case 'document-enhancement':
      return 'Enhance Image';
    case 'ocr':
      return 'Extract Text';
    case 'face-verify':
      return 'Verify Face';
    case 'face-cropping':
      return 'Crop Face';
    default:
      return 'Process Image';
  }
};

export const getDownloadFileName = (solutionType: SolutionType, fileName?: string): string => {
  const timestamp = Date.now();
  const baseName = fileName?.replace(/\.[^/.]+$/, "") || 'processed';
  
  switch (solutionType) {
    case 'id-crop':
      return `cropped-id-${baseName}-${timestamp}.png`;
    case 'document-enhancement':
      return `enhanced-${baseName}-${timestamp}.png`;
    case 'face-cropping':
      return `cropped-face-${baseName}-${timestamp}.png`;
    case 'qr-extract':
      return `qr-extracted-${baseName}-${timestamp}.png`;
    default:
      return `processed-${baseName}-${timestamp}.png`;
  }
};
