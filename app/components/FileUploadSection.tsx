// components/FileUploadSection.tsx
import React from 'react';
import { Send } from 'lucide-react';
import { FileUpload } from '../components/ui/file-upload';
import { Solution, SolutionType } from '../types/solution';
import { getButtonText } from '../../utils/solutionHelpers';

interface FileUploadSectionProps {
  solution: Solution;
  solutionType: SolutionType;
  files: File[];
  onFileUpload: (files: File[]) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  solution,
  solutionType,
  files,
  onFileUpload,
  onSubmit,
  loading
}) => {
  const isSignatureVerification = solutionType === 'signature-verification';

  return (
    <div className="space-y-6">
      {/* File Upload Component */}
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={onFileUpload} />
      </div>

      {/* Requirement Notice for Signature Verification */}
      {isSignatureVerification && (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <h4 className="font-semibold text-blue-400">Signature Verification Requirements</h4>
          </div>
          <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
            <li>Upload exactly 2 signature images</li>
            <li>Images should be clear and well-lit</li>
            <li>Supported formats: JPG, PNG, GIF</li>
            <li>Maximum file size: 10MB per image</li>
          </ul>
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isSignatureVerification ? `Signature ${index + 1}: ` : ''}{file.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {index === files.length - 1 && (
                  <button
                    onClick={onSubmit}
                    disabled={loading || (isSignatureVerification && files.length !== 2)}
                    className={`px-6 py-2 bg-gradient-to-r ${solution.gradient} rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{getButtonText(solutionType)}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* Show requirement status for signature verification */}
          {isSignatureVerification && (
            <div className="text-center text-sm">
              <span className={files.length === 2 ? 'text-green-400' : 'text-yellow-400'}>
                {files.length}/2 signatures uploaded
                {files.length === 2 ? ' ✓' : ' (need 2 for comparison)'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
