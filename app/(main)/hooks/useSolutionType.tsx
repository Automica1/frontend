// hooks/useSolutionType.ts
import { useMemo } from 'react';
import { Solution, SolutionType } from '../types/solution';

export const useSolutionType = (solution: Solution): SolutionType => {
  return useMemo(() => {
    const slug = solution.slug?.toLowerCase();
    const title = solution.title.toLowerCase();
    
    console.log('Solution detection:', { slug, title });
    
    if (slug === 'qr-extract' || title.includes('qr extract')) {
      console.log('Detected: QR Extract');
      return 'qr-extract';
    }
    if (slug === 'qr-mask' || title.includes('qr mask')) {
      console.log('Detected: QR Mask');
      return 'qr-mask';
    }
    if (slug === 'signature-verification' || title.includes('signature verification')) {
      console.log('Detected: Signature Verification');
      return 'signature-verification';
    }
    if (slug === 'id-crop' || slug === 'id-cropping' || title.includes('id crop')) {
      console.log('Detected: ID Crop');
      return 'id-crop';
    }
    if (slug === 'face-verify' || slug === 'face-verification' || title.includes('face verify')) {
      console.log('Detected: Face Verify');
      return 'face-verify';
    }
    if (slug === 'face-cropping' || slug === 'face-crop' || title.includes('face crop')) {
      console.log('Detected: Face Cropping');
      return 'face-cropping';
    }
    
    console.warn('Unknown solution type, defaulting to unknown');
    return 'unknown';
  }, [solution.slug, solution.title]);
};