import React from 'react';
import { Send, FileImage, Users, QrCode, UserCheck, Crop, Shield } from 'lucide-react';
import { Solution, SolutionType } from '../../types/solution';

interface ProcessingActionCardProps {
  solution: Solution;
  solutionType: SolutionType;
  files: File[];
  onSubmit: () => void;
  loading: boolean;
}

export const ProcessingActionCard: React.FC<ProcessingActionCardProps> = ({
  solution,
  solutionType,
  files,
  onSubmit,
  loading
}) => {
  const getButtonText = (type: SolutionType) => {
    switch (type) {
      case 'signature-verification': return 'Compare Signatures';
      case 'qr-extract': return 'Extract QR Code';
      case 'id-crop': return 'Crop ID Document';
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
    
    if (solutionType === 'signature-verification') {
      if (files.length === 1) {
        return 'Upload one more signature to compare';
      }
      if (files.length === 2) {
        return 'Ready to compare signatures';
      }
      return 'Please upload exactly 2 signatures';
    }
    
    if (solutionType === 'face-verify') {
      if (files.length === 1) {
        return 'Upload one more face image to compare';
      }
      if (files.length === 2) {
        return 'Ready to verify faces';
      }
      return 'Please upload exactly 2 face images';
    }
    
    return `Ready to process ${files.length} file${files.length > 1 ? 's' : ''}`;
  };

  const isDisabled = () => {
    if (loading) return true;
    if (files.length === 0) return true;
    if ((solutionType === 'signature-verification' || solutionType === 'face-verify') && files.length !== 2) return true;
    return false;
  };

  const Icon = getIcon(solutionType);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6 pb-0">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${solution.gradient} rounded-lg flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Process Files
              </h3>
              <p className="text-sm text-gray-400">
                {getStatusMessage()}
              </p>
            </div>
          </div>

          {/* File Summary */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-gray-300 text-sm">
                        {getFileDisplayName(file, index)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                </div>
              ))}
            </div>
          )}

          {/* Special requirements for signature verification */}
          {solutionType === 'signature-verification' && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold text-blue-400">Requirements</h4>
              </div>
              <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
                <li>Upload exactly 2 signature images</li>
                <li>Images should be clear and well-lit</li>
                <li>Supported formats: JPG, PNG, JPEG</li>
              </ul>
              <div className="mt-2 text-center">
                <span className={`text-sm font-medium ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {files.length}/2 signatures uploaded
                  {files.length === 2 ? ' ✓' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Special requirements for face verification */}
          {solutionType === 'face-verify' && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold text-blue-400">Requirements</h4>
              </div>
              <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
                <li>Upload exactly 2 face images</li>
                <li>Images should be clear and well-lit</li>
                <li>Supported formats: JPG, PNG, JPEG</li>
                {/* <li>Each file must be less than 10MB</li> */}
              </ul>
              <div className="mt-2 text-center">
                <span className={`text-sm font-medium ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {files.length}/2 face images uploaded
                  {files.length === 2 ? ' ✓' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Requirements for single image services */}
          {solutionType !== 'signature-verification' && solutionType !== 'face-verify' && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
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
                  {files.length}/1 image uploaded
                  {files.length === 1 ? ' ✓' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Process Button at bottom */}
      <div className="flex-shrink-0 p-6 pt-4 ">
        <button
          onClick={onSubmit}
          disabled={isDisabled()}
          className={`w-full px-6 py-4 bg-gradient-to-r ${solution.gradient} rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
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