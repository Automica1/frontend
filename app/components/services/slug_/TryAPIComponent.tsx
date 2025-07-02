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
    console.log('Files uploaded:', uploadedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
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
              onSubmit={handleSubmit}
              loading={currentApi.loading}
            />
          </div>

          {/* Right Column - Tabbed Results */}
          <div className="space-y-6">
            <TabbedResponseSection
              solution={solution}
              solutionType={solutionType}
              data={currentApi.data}
              loading={currentApi.loading}
              error={currentApi.error}
              maskedBase64={maskedBase64}
              fileName={files[0]?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}