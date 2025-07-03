// Main refactored component: TryAPIComponent.tsx
"use client";
import React, { useState } from 'react';
import { Solution, SolutionType } from '../../../types/solution';
import { useSolutionType } from '../../../hooks/useSolutionType';
import { useSolutionApi } from '../../../hooks/useSolutionApi';
import { getFileRequirementText } from '../../../../utils/solutionHelpers';
import { fileToBase64, filesToBase64 } from '@/utils/fileUtils';
import { FileUploadSection } from '../../FileUploadSection';
import { TabbedResponseSection } from '../../TabbedResponseSection';

interface TryAPIComponentProps {
  solution: Solution;
}

export default function TryAPIComponent({ solution }: TryAPIComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);
  const solutionType = useSolutionType(solution);
  const currentApi = useSolutionApi(solutionType);

  const Icon = solution.IconComponent;

  const handleFileUpload = (uploadedFiles: File[]) => {
    // For signature verification, limit to 2 files
    if (solutionType === 'signature-verification' && uploadedFiles.length > 2) {
      alert('Please upload only 2 images for signature verification');
      return;
    }
    
    setFiles(uploadedFiles);
    currentApi.reset();
    // Reset processing state when new files are uploaded
    setHasStartedProcessing(false);
    console.log('Files uploaded:', uploadedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    // Set processing state to true to show results section
    setHasStartedProcessing(true);
    
    console.log('Submitting with solution type:', solutionType);
    
    try {
      switch (solutionType) {
        case 'signature-verification':
          if (files.length !== 2) {
            throw new Error('Please upload exactly 2 signature images');
          }
          const base64Images = await filesToBase64(files);
          console.log('Calling signature verification API');
          await currentApi.execute(base64Images);
          break;
          
        case 'qr-extract':
          const qrBase64 = await fileToBase64(files[0]);
          console.log('Calling QR extract API');
          await currentApi.execute(qrBase64);
          break;
          
        case 'id-crop':
          const idBase64 = await fileToBase64(files[0]);
          console.log('Calling ID crop API');
          await currentApi.execute(idBase64);
          break;
          
        case 'face-verify':
          const faceVerifyBase64 = await fileToBase64(files[0]);
          console.log('Calling face verify API');
          await currentApi.execute(faceVerifyBase64);
          break;
          
        case 'face-cropping':
          const faceCropBase64 = await fileToBase64(files[0]);
          console.log('Calling face crop API');
          await currentApi.execute(faceCropBase64);
          break;
          
        default:
          console.error('Unknown solution type in handleSubmit:', solutionType);
          throw new Error(`Unsupported solution type: ${solutionType}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setHasStartedProcessing(false);
    currentApi.reset();
  };

  // Get the masked base64 from response
  const getMaskedBase64 = () => {
    const data = currentApi.data;
    // Type guard for cropResult property
    const hasCropResult = (obj: any): obj is { cropResult: { result?: string } } =>
      obj && typeof obj === 'object' && 'cropResult' in obj;

    console.log('Getting masked base64 for solution type:', solutionType);
    
    if (solutionType === 'qr-extract') {
      // Type guard for masked_base64 property
      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }
      return undefined;
    }
    
    if (solutionType === 'id-crop') {
      if (hasCropResult(data) && data.cropResult?.result) {
        return data.cropResult.result;
      }
      // Only return processed_image if it exists on the data object
      return (data && 'result' in data && data.result)
        || (data && 'processed_image' in data && (data as any).processed_image);
    }
    
    if (solutionType === 'face-cropping') {
      // Type guard for FaceDetectionResponse
      if (data && typeof data === 'object') {
        if ('processed_image' in data && typeof (data as any).processed_image === 'string') {
          return (data as any).processed_image;
        }
        if ('result_image' in data && typeof (data as any).result_image === 'string') {
          return (data as any).result_image;
        }
        if ('cropped_face' in data && typeof (data as any).cropped_face === 'string') {
          return (data as any).cropped_face;
        }
      }
      return undefined;
    }
    
    if (solutionType === 'face-verify') {
      if (data && typeof data === 'object') {
        if ('processed_image' in data && typeof (data as any).processed_image === 'string') {
          return (data as any).processed_image;
        }
        if ('result_image' in data && typeof (data as any).result_image === 'string') {
          return (data as any).result_image;
        }
      }
      return undefined;
    }
    
    if (data && typeof data === 'object') {
      if ('processed_image' in data && typeof (data as any).processed_image === 'string') {
        return (data as any).processed_image;
      }
      if ('result_image' in data && typeof (data as any).result_image === 'string') {
        return (data as any).result_image;
      }
      if ('masked_base64' in data && typeof (data as any).masked_base64 === 'string') {
        return (data as any).masked_base64;
      }
    }
    return undefined;
  };

  const maskedBase64 = getMaskedBase64();

  return (
    <div className="pt-16 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Try {solution.title}
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {getFileRequirementText(solutionType)}. Upload your files and test the API functionality.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - File Upload */}
          <div className="space-y-6">
            <FileUploadSection
              solution={solution}
              solutionType={solutionType}
              files={files}
              onFileUpload={handleFileUpload}
            />
          </div>

          {/* Right Column - Conditional Content */}
          <div className="space-y-6">
            {!hasStartedProcessing ? (
              /* Show Processing Action Section before processing */
              <ProcessingActionSection
                solution={solution}
                solutionType={solutionType}
                files={files}
                onSubmit={handleSubmit}
                loading={currentApi.loading}
              />
            ) : (
              /* Show Results Section after processing starts */
              <TabbedResponseSection
                solution={solution}
                solutionType={solutionType}
                data={currentApi.data}
                loading={currentApi.loading}
                error={currentApi.error}
                maskedBase64={maskedBase64}
                fileName={files[0]?.name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated component for the processing action section
interface ProcessingActionSectionProps {
  solution: Solution;
  solutionType: SolutionType;
  files: File[];
  onSubmit: () => void;
  loading: boolean;
}

const ProcessingActionSection: React.FC<ProcessingActionSectionProps> = ({
  solution,
  solutionType,
  files,
  onSubmit,
  loading
}) => {
  const { Send, FileImage, Users, QrCode, UserCheck, Crop } = require('lucide-react');
  
  const getButtonText = (type: SolutionType) => {
    switch (type) {
      case 'signature-verification': return 'Compare Signatures';
      case 'qr-extract': return 'Extract QR Code';
      case 'id-crop': return 'Crop ID Document';
      case 'face-verify': return 'Verify Face';
      case 'face-cropping': return 'Crop Face';
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
      default: return FileImage;
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
    
    return `Ready to process ${files.length} file${files.length > 1 ? 's' : ''}`;
  };

  const isDisabled = () => {
    if (loading) return true;
    if (files.length === 0) return true;
    if (solutionType === 'signature-verification' && files.length !== 2) return true;
    return false;
  };

  const Icon = getIcon(solutionType);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
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
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-300">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300 truncate">
                      {solutionType === 'signature-verification' ? `Signature ${index + 1}` : file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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
              <li>Supported formats: JPG, PNG, GIF</li>
            </ul>
            <div className="mt-2 text-center">
              <span className={`text-sm font-medium ${files.length === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                {files.length}/2 signatures uploaded
                {files.length === 2 ? ' ✓' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Process Button */}
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