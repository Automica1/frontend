// hooks/useClipboard.ts
import { useState, useCallback } from 'react';
import { copyToClipboard } from '../../utils/imageUtils';

export const useClipboard = (resetDelay: number = 2000) => {
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [copiedApiResponse, setCopiedApiResponse] = useState(false);

  const copyBase64 = useCallback(async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), resetDelay);
    }
  }, [resetDelay]);

  const copyApiResponse = useCallback(async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedApiResponse(true);
      setTimeout(() => setCopiedApiResponse(false), resetDelay);
    }
  }, [resetDelay]);

  return {
    copiedBase64,
    copiedApiResponse,
    copyBase64,
    copyApiResponse
  };
};