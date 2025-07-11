// Fixed TryAPIComponent.tsx with proper face verification support
"use client";
import React, { useState } from 'react';
import { Solution, SolutionType } from '../../../types/solution';
import { useSolutionType } from '../../../hooks/useSolutionType';
import { useSolutionApi } from '../../../hooks/useSolutionApi';
import { getFileRequirementText } from '../../../../utils/solutionHelpers';
import { fileToBase64, filesToBase64 } from '@/utils/fileUtils';
import { FileUpload2 } from '../../ui/file-upload2';
import { FileUpload } from '../../ui/file-upload';
import { TabbedResponseSection } from '../../TabbedResponseSection';
import { ProcessingActionCard } from '../ProcessingActionCard';

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
    // For signature verification and face verification, limit to 2 files
    if ((solutionType === 'signature-verification' || solutionType === 'face-verify') && uploadedFiles.length > 2) {
      alert(`Please upload only 2 images for ${solutionType === 'signature-verification' ? 'signature verification' : 'face verification'}`);
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
          
        case 'face-verify':
          if (files.length !== 2) {
            throw new Error('Please upload exactly 2 face images for verification');
          }
          const faceBase64Images = await filesToBase64(files);
          console.log('Calling face verify API with 2 images');
          await currentApi.execute(faceBase64Images[0], faceBase64Images[1]);
          break;
          
        case 'qr-extract':
          const qrBase64 = await fileToBase64(files[0]);
          console.log('Calling QR extract API');
          await currentApi.execute(qrBase64);
          break;
          
        case 'qr-mask':
          const qrMaskBase64 = await fileToBase64(files[0]);
          console.log('Calling QR mask API');
          await currentApi.execute(qrMaskBase64);
          break;
          
        case 'id-crop':
          const idBase64 = await fileToBase64(files[0]);
          console.log('Calling ID crop API');
          await currentApi.execute(idBase64);
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
    console.log('Getting masked base64 for solution type:', solutionType);
    console.log('Current data:', data);
    
    // For face detection/verification, check faceResult.data[0]
    if (solutionType === 'face-verify' || solutionType === 'face-cropping') {
      if (data && typeof data === 'object' && 'faceResult' in data) {
        const faceResult = (data as any).faceResult;
        if (faceResult && typeof faceResult === 'object' && 'data' in faceResult && Array.isArray(faceResult.data) && faceResult.data.length > 0) {
          console.log('Found face result data:', faceResult.data[0]);
          return faceResult.data[0];
        }
      }
      
      // Fallback to other possible properties
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
    
    // Type guard for cropResult property
    const hasCropResult = (obj: any): obj is { cropResult: { result?: string } } =>
      obj && typeof obj === 'object' && 'cropResult' in obj;
    
    if (solutionType === 'qr-extract') {
      // Type guard for masked_base64 property
      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }
      return undefined;
    }
    
    if (solutionType === 'qr-mask') {
      // For qr-mask, get masked_base64 from qrResult
      if (data && typeof data === 'object' && 'qrResult' in data) {
        const qrResult = (data as any).qrResult;
        if (qrResult && typeof qrResult === 'object' && 'masked_base64' in qrResult) {
          return qrResult.masked_base64;
        }
      }
      
      // Fallback to direct masked_base64 property
      if (data && typeof data === 'object' && 'masked_base64' in data) {
        return (data as any).masked_base64;
      }
      
      // Also check for other possible response properties
      if (data && typeof data === 'object' && 'result' in data) {
        return (data as any).result;
      }
      if (data && typeof data === 'object' && 'processed_image' in data) {
        return (data as any).processed_image;
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
    
    // Generic fallback for other solution types
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
  console.log('Final masked base64 length:', maskedBase64 ? maskedBase64.length : 0);

  // Determine which file upload component to use
  const shouldUseFileUpload2 = solutionType === 'signature-verification' || solutionType === 'face-verify';
  
  // Determine height based on solution type
  const containerHeight = shouldUseFileUpload2 ? 'h-[600px]' : 'h-[600px]';

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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - File Upload */}
          <div className="space-y-6">
            {/* Conditional FileUpload component usage with dynamic height */}
            <div className={`w-full max-w-4xl mx-auto min-h-96 ${containerHeight} border border-dashed bg-black border-neutral-800 rounded-lg`}>
              {shouldUseFileUpload2 ? (
                <FileUpload2 onChange={handleFileUpload} />
              ) : (
                <FileUpload onChange={handleFileUpload} />
              )}
            </div>
          </div>

          {/* Right Column - Conditional Content */}
          <div className="space-y-6">
            {!hasStartedProcessing ? (
              /* Show Processing Action Card before processing */
              <ProcessingActionCard
                solution={solution}
                solutionType={solutionType}
                files={files}
                onSubmit={handleSubmit}
                loading={currentApi.loading}
              />
            ) : (
              /* Show Results Section after processing starts with matching height */
              <div className={containerHeight}>
                <TabbedResponseSection
                  solution={solution}
                  solutionType={solutionType}
                  data={currentApi.data}
                  loading={currentApi.loading}
                  error={currentApi.error}
                  errorDetails={currentApi.errorData}
                  maskedBase64={maskedBase64}
                  fileName={files[0]?.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}