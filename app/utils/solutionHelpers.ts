// utils/solutionHelpers.ts
import { SolutionType } from '../(main)/types/solution';

export const getFileRequirementText = (solutionType: SolutionType): string => {
  switch (solutionType) {
    case 'signature-verification':
      return 'Upload exactly 2 signature images for comparison';
    case 'qr-extract':
      return 'Upload an image containing QR codes';
    case 'id-crop':
      return 'Upload an ID document image';
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
    case 'face-cropping':
      return `cropped-face-${baseName}-${timestamp}.png`;
    case 'qr-extract':
      return `qr-extracted-${baseName}-${timestamp}.png`;
    default:
      return `processed-${baseName}-${timestamp}.png`;
  }
};