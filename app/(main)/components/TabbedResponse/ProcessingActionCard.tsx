// frontend/app/components/services/ProcessingActionCard.tsx
import React from 'react';
import { Send, FileImage, Users, QrCode, UserCheck, Crop, Shield, FileText, Info } from 'lucide-react';
import { SolutionType } from '../../types/solution';
import { getExtraResourceCopy } from '../../lib/extraResourceCopy';
import { getServiceRunCost } from '../../lib/serviceRunCosts';
import type { ServicePolicy } from '../../lib/solutions';

interface ProcessingActionCardProps {
  solution: {
    gradient: string;
    servicePolicy?: ServicePolicy;
  };
  solutionType: SolutionType;
  files: File[];
  onSubmit: () => void;
  loading: boolean;
  betaControls?: React.ReactNode;
  submitBlocked?: boolean;
  submitBlockedMessage?: string;
  validationMessage?: string;
  embedded?: boolean;
  /** Slim upload hint while GPU session is starting (saves vertical space). */
  compactRequirements?: boolean;
  /** GPU beta: compare blocked until session ceremony completes. */
  gpuSessionPending?: boolean;
}

export const ProcessingActionCard: React.FC<ProcessingActionCardProps> = ({
  solution,
  solutionType,
  files,
  onSubmit,
  loading,
  betaControls,
  submitBlocked = false,
  submitBlockedMessage,
  validationMessage,
  embedded = false,
  compactRequirements = false,
  gpuSessionPending = false,
}) => {
  const runCost = getServiceRunCost(solutionType);
  const getButtonText = (type: SolutionType) => {
    switch (type) {
      case 'signature-verification': return 'Compare Signatures';
      case 'qr-extract': return 'Extract QR Code';
      case 'id-crop': return 'Crop ID Document';
      case 'document-enhancement': return 'Enhance Document';
      case 'ocr': return 'Extract Text';
      case 'face-verify': return 'Verify Face';
      case 'face-cropping': return 'Crop Face';
      case 'qr-mask': return 'Mask QR Code';
      default: return 'Process Image';
    }
  };

  const getIcon = (type: SolutionType) => {
    switch (type) {
      case 'signature-verification': return Users;
      case 'qr-extract': return QrCode;
      case 'id-crop': return Crop;
      case 'document-enhancement': return FileImage;
      case 'ocr': return FileText;
      case 'face-verify': return UserCheck;
      case 'face-cropping': return Crop;
      case 'qr-mask': return Shield;
      default: return FileImage;
    }
  };

  const getFileDisplayName = (file: File, index: number) => {
    switch (solutionType) {
      case 'signature-verification':
        return `Signature ${index + 1}`;
      case 'face-verify':
        return `Face ${index + 1}`;
      default:
        return file.name;
    }
  };

  const getStatusMessage = () => {
    if (files.length === 0) {
      return 'Upload files to get started';
    }

    const filesReady =
      solutionType === 'signature-verification' || solutionType === 'face-verify'
        ? files.length === 2
        : files.length >= 1;

    if (gpuSessionPending && filesReady) {
      return getExtraResourceCopy().compareGatePending;
    }

    if (solutionType === 'signature-verification') {
      if (files.length === 1) return 'Upload one more signature to compare';
      if (files.length === 2) return 'Ready to compare signatures';
      return 'Please upload exactly 2 signature images';
    }

    if (solutionType === 'face-verify') {
      if (files.length === 1) return 'Upload one more face image to verify';
      if (files.length === 2) return 'Ready to verify faces';
      return 'Please upload exactly 2 face images';
    }

    return `Ready to process ${files.length} file${files.length > 1 ? 's' : ''}`;
  };

  const isDisabled = () => {
    if (loading) return true;
    if (submitBlocked) return true;
    if (files.length === 0) return true;
    if ((solutionType === 'signature-verification' || solutionType === 'face-verify') && files.length !== 2) return true;
    return false;
  };

  const Icon = getIcon(solutionType);
  const shellClass = embedded
    ? 'h-full flex flex-col overflow-hidden'
    : 'bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col overflow-hidden';

  const policy = solution.servicePolicy;
  const policySummary = solutionType !== 'ocr' && (policy?.notes?.length || policy?.limits?.length || policy?.pricing?.length) ? (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-wide text-blue-200/70">Policy</p>
        <span className="text-[11px] text-blue-100/70">
          {policy?.pricingMode ? policy.pricingMode.replace('_', ' ') : 'Configurable'}
        </span>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {policy?.limits?.length ? (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Limits</p>
            <div className="mt-2 space-y-1">
              {policy.limits.map((row) => (
                <div key={`limit-${row.label}`} className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-gray-300">{row.label}</span>
                  <span className="text-right text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {policy?.pricing?.length ? (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Credits</p>
            <div className="mt-2 space-y-1">
              {policy.pricing.map((row) => (
                <div key={`price-${row.label}`} className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-gray-300">{row.label}</span>
                  <span className="text-right text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {policy?.notes?.length ? (
        <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
          {policy.notes.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300/60" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  ) : null;

  const requirementsBlock = (() => {
    if (compactRequirements) {
      if (solutionType === 'signature-verification') {
        return (
          <p className={`text-xs ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
            2 signatures required · {files.length}/2 uploaded
          </p>
        );
      }
      if (solutionType === 'face-verify') {
        return (
          <p className={`text-xs ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
            2 face images required · {files.length}/2 uploaded
          </p>
        );
      }
      return (
        <p className={`text-xs ${files.length === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
          1 file required · {files.length}/1 uploaded
        </p>
      );
    }

    if (solutionType === 'signature-verification') {
      return (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <h4 className="text-sm font-semibold text-blue-400">Requirements</h4>
          </div>
          <ul className="text-blue-300 space-y-0.5 list-disc list-inside text-xs">
            <li>Upload exactly 2 signature images</li>
            <li>Clear, well-lit images · JPG, PNG, JPEG</li>
          </ul>
          <div className="mt-1 text-center">
            <span className={`text-xs font-medium ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
              {files.length}/2 signatures uploaded{files.length === 2 ? ' ✓' : ''}
            </span>
          </div>
        </div>
      );
    }

    if (solutionType === 'face-verify') {
      return (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <h4 className="text-sm font-semibold text-blue-400">Requirements</h4>
          </div>
          <ul className="text-blue-300 text-xs space-y-0.5 list-disc list-inside">
            <li>Upload exactly 2 face images</li>
            <li>Images should be clear and well-lit</li>
            <li>Supported formats: JPG, PNG, JPEG</li>
          </ul>
          <div className="mt-1 text-center">
            <span className={`text-xs font-medium ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
              {files.length}/2 face images uploaded{files.length === 2 ? ' ✓' : ''}
            </span>
          </div>
        </div>
      );
    }

    if (solutionType === 'ocr') {
      const limitRows = policy?.limits ?? [
        { label: 'Upload size', value: '100 MB' },
        { label: 'File count', value: '1 file' },
        { label: 'Page count', value: 'Backend-configured' },
        { label: 'Formats', value: 'PDF, JPG, PNG, JPEG' },
      ];
      const pricingRows = policy?.pricing ?? [
        { label: 'API hit', value: `${runCost} credits` },
        { label: 'Session start', value: '20 credits' },
        { label: 'Runtime', value: '2 credits / minute' },
      ];

      return (
        <div className="rounded-lg border border-blue-500 bg-blue-900/20 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h4 className="font-semibold text-blue-400">Requirements</h4>
          </div>
          <ul className="space-y-1 text-sm text-blue-300 list-disc list-inside">
            <li>Start a processing session to use OCR</li>
            <li>Upload exactly one PDF or document image</li>
            <li>Supported formats: PDF, JPG, PNG, JPEG</li>
          </ul>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-blue-200/70">Limits</p>
              <div className="mt-2 space-y-1">
                {limitRows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-blue-200/80">{row.label}</span>
                    <span className="text-right text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-blue-200/70">Credits</p>
              <div className="mt-2 space-y-1">
                {pricingRows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-blue-200/80">{row.label}</span>
                    <span className="text-right text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-center">
            <span className={`text-sm font-medium ${files.length === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
              {files.length}/1 file uploaded{files.length === 1 ? ' ✓' : ''}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <h4 className="font-semibold text-blue-400">Requirements</h4>
        </div>
        <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
          <li>Upload exactly one image</li>
          <li>Images should be clear and well-lit</li>
          <li>Supported formats: JPG, PNG, JPEG</li>
          <li>The file must be less than 10MB</li>
        </ul>
        <div className="mt-2 text-center">
          <span className={`text-sm font-medium ${files.length === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
            {files.length}/1 image uploaded{files.length === 1 ? ' ✓' : ''}
          </span>
        </div>
      </div>
    );
  })();

  return (
    <div className={shellClass}>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-0 space-y-3">
        {!embedded && (
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${solution.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">Process Files</h3>
              <p className="text-xs text-gray-400 truncate">{getStatusMessage()}</p>
            </div>
          </div>
        )}

        {embedded && (
          <p className="text-xs text-gray-400">{getStatusMessage()}</p>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-300">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-gray-300 text-sm">{getFileDisplayName(file, index)}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {requirementsBlock}
        {policySummary}
        {betaControls}
      </div>

      <div className="flex-shrink-0 space-y-2 p-4 pt-3">
        {validationMessage && (
          <p className="text-xs text-red-300 rounded-md border border-red-500/30 bg-red-950/20 px-3 py-2">
            {validationMessage}
          </p>
        )}
        {submitBlocked && submitBlockedMessage && (
          <p className="text-xs text-blue-200/90 rounded-md border border-blue-500/30 bg-blue-950/20 px-3 py-2">
            {submitBlockedMessage}
          </p>
        )}
        <button
          onClick={onSubmit}
          disabled={isDisabled()}
          className={`w-full px-4 py-3 text-base bg-gradient-to-r ${solution.gradient} rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{getButtonText(solutionType)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
