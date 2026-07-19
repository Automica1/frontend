// components/TabbedResponseSection/ResultTab.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Check, Copy, QrCode, Shield, AlertCircle, Maximize2, Minimize2, WrapText } from 'lucide-react';
import { SolutionType } from '../../types/solution';
import {
  extractProcessedImageBase64,
  getFileRequirementText,
  getProcessingMessage,
  isImageOutputSolution,
} from '../../../utils/solutionHelpers';
import { QrExtractionResult } from './QrExtractionResult';
import { VerificationResult } from './VerificationResult';
import { ProcessedImageTab } from './ProcessedImageTab';

interface ResultTabProps {
  solutionType: SolutionType;
  data: any;
  loading: boolean;
  solution: {
    [key: string]: any;
    IconComponent?: React.ComponentType<any>;
    icon?: React.ComponentType<any>;
  };
  error?: string | null;
  errorDetails?: any | null;
  compactResult?: boolean;
  processedImageBase64?: string;
  fileName?: string;
  inputPreviewUrl?: string;
  inputFileType?: 'image' | 'pdf';
  copiedBase64?: boolean;
  onCopyBase64?: (base64: string) => void;
  fileType?: 'image' | 'pdf';
  mimeType?: string;
}

export const ResultTab: React.FC<ResultTabProps> = ({
  solutionType,
  data,
  loading,
  solution,
  error,
  errorDetails,
  compactResult = false,
  processedImageBase64,
  fileName,
  inputPreviewUrl,
  inputFileType,
  copiedBase64 = false,
  onCopyBase64,
  fileType = 'image',
  mimeType,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [wrapText, setWrapText] = useState(false);
  const isVerificationSolution = solutionType === 'face-verify' || solutionType === 'signature-verification';
  const isQrExtractSolution = solutionType === 'qr-extract';
  const imageBase64 = processedImageBase64 || extractProcessedImageBase64(solutionType, data);

  useEffect(() => {
    if (!isInspectorOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInspectorOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isInspectorOpen]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      window.setTimeout(() => setCopiedText(false), 1800);
    }).catch((err) => {
      console.error('Failed to copy OCR text:', err);
    });
  };

  if (error) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {isQrExtractSolution ? 'QR Code Extraction Failed' :
             isVerificationSolution ? 'Verification Failed' : 'Processing Failed'}
          </h3>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-3 text-lg">Technical Error</h4>
              <p className="text-red-300 mb-4 leading-relaxed">{error}</p>

              {errorDetails?.technical_message && (
                <div>
                  <p className="text-gray-300 text-sm">{errorDetails.technical_message}</p>
                </div>
              )}

              {errorDetails?.status && (
                <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-800/30 rounded">
                  <span>Status: {errorDetails.status}</span>
                  {errorDetails.type && <span className="ml-4">Type: {errorDetails.type}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          {isQrExtractSolution ? (
            <QrCode className="w-8 h-8 text-gray-600" />
          ) : (
            <Shield className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <p className="text-gray-400">{getProcessingMessage(solutionType)}</p>
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mt-4" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          {isQrExtractSolution ? (
            <QrCode className="w-8 h-8 text-gray-600" />
          ) : (
            <Shield className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <p className="text-gray-400">
          {`${getFileRequirementText(solutionType)} to see the ${isQrExtractSolution ? 'extraction' : isImageOutputSolution(solutionType) ? 'processed' : 'verification'} result`}
        </p>
      </div>
    );
  }

  if (isQrExtractSolution && data.qrResult) {
    return <QrExtractionResult qrResult={data.qrResult} />;
  }

  if (isVerificationSolution) {
    return (
      <VerificationResult
        solutionType={solutionType}
        data={data}
        compact={compactResult}
      />
    );
  }

  if (solutionType === 'ocr') {
    const result = data?.ocrResult ?? data;
    const text = result?.data?.text ?? '';
    const displayText = text || 'No text was returned for this document.';
    return (
      <>
      <div className="h-full overflow-y-auto p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white">Extracted Text</h3>
            <p className="text-sm text-gray-400">Text extraction completed</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInspectorOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:border-cyan-400/40 hover:bg-cyan-500/15"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Open larger</span>
            </button>
            <button
              type="button"
              onClick={() => copyText(displayText)}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-gray-700 bg-gray-800/70 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-800"
            >
              {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
              <span>{copiedText ? 'Copied' : 'Copy text'}</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-950 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-gray-100">
            {displayText}
          </pre>
        </div>
      </div>
      {isInspectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsInspectorOpen(false)}
          role="presentation"
        >
          <div
            className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ocr-inspector-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <h3 id="ocr-inspector-title" className="text-lg font-semibold text-white">
                  Document and extracted text
                </h3>
                <p className="text-sm text-gray-400">
                  Input document alongside the full OCR text
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWrapText((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/70 px-3 py-2 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-800"
                >
                  <WrapText className="h-3.5 w-3.5 text-gray-400" />
                  <span>{wrapText ? 'No wrap' : 'Wrap lines'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyText(displayText)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/70 px-3 py-2 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-800"
                >
                  {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                  <span>{copiedText ? 'Copied' : 'Copy text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/70 px-3 py-2 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-800"
                >
                  <Minimize2 className="h-3.5 w-3.5 text-gray-400" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            <div
              className={`grid min-h-0 flex-1 gap-0 overflow-hidden ${
                inputPreviewUrl ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]' : ''
              }`}
            >
              {inputPreviewUrl && (
                <div className="min-h-0 overflow-auto border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1020]/95 px-5 py-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Input</p>
                    <span className="text-xs text-gray-500">
                      {inputFileType === 'pdf' ? 'PDF preview' : 'Image preview'}
                    </span>
                  </div>
                  <div className="flex min-h-full items-center justify-center p-4">
                    {inputFileType === 'pdf' ? (
                      <iframe
                        src={inputPreviewUrl}
                        title={fileName || 'Input PDF'}
                        className="h-[78vh] w-full rounded-lg border border-white/10 bg-black"
                      />
                    ) : (
                      <img
                        src={inputPreviewUrl}
                        alt={fileName || 'Input preview'}
                        className="max-h-[78vh] max-w-full rounded-lg border border-white/10 object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="min-h-0 overflow-auto bg-black/20">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1020]/95 px-5 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Extracted text</p>
                  <span className="text-xs text-gray-500">
                    {wrapText ? 'Wrapped for reading' : 'Preserving line structure'}
                  </span>
                </div>
                <pre
                  className={`min-h-full px-5 py-4 text-sm leading-6 text-gray-100 ${
                    wrapText ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
                  }`}
                >
                  {displayText}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  if (isImageOutputSolution(solutionType)) {
    return (
      <ProcessedImageTab
        solutionType={solutionType}
        loading={loading}
        maskedBase64={imageBase64}
        fileName={fileName}
        hasProcessedImage={Boolean(imageBase64 && imageBase64.length > 0)}
        copiedBase64={copiedBase64}
        onCopyBase64={onCopyBase64 || (() => undefined)}
        error={error}
        errorDetails={errorDetails}
        fileType={fileType}
        mimeType={mimeType}
      />
    );
  }

  return (
    <div className="text-center py-12 h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-gray-400">No result data available</p>
    </div>
  );
};
