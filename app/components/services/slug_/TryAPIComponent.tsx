// app/solutions/[slug]/components/TryAPIComponent.tsx
"use client";
import React, { useState } from 'react';
import { Send, Copy, Check, Download, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from '../../ui/file-upload';
import { apiService } from "../../../lib/apiService"
import { useApi } from '../../../hooks/useApi';
import { fileToBase64, filesToBase64 } from '@/utils/fileUtils';

interface TryAPIComponentProps {
  solution: {
    title: string;
    IconComponent: React.ComponentType<any>;
    gradient: string;
    apiEndpoint?: string;
    slug?: string;
  };
}

export default function TryAPIComponent({ solution }: TryAPIComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);

  // API hooks for different solutions - BIND THE METHODS
  const qrExtract = useApi(apiService.extractQRCode.bind(apiService));
  const signatureVerify = useApi(apiService.verifySignatures.bind(apiService));
  const idCrop = useApi(apiService.processIdCrop.bind(apiService));
  const faceVerify = useApi(apiService.verifyFace.bind(apiService));
  const faceCrop = useApi(apiService.cropFace.bind(apiService));

  const Icon = solution.IconComponent;

  // Enhanced solution type detection with better logging
  const getSolutionType = () => {
    const slug = solution.slug?.toLowerCase();
    const title = solution.title.toLowerCase();
    
    console.log('Solution detection:', { slug, title });
    
    if (slug === 'qr-extract' || title.includes('qr extract')) {
      console.log('Detected: QR Extract');
      return 'qr-extract';
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
    
    console.warn('Unknown solution type, defaulting to qr-extract');
    return 'unknown';
  };

  const solutionType = getSolutionType();
  
  // Boolean flags for easier checking
  const isQRExtract = solutionType === 'qr-extract';
  const isSignatureVerification = solutionType === 'signature-verification';
  const isIdCrop = solutionType === 'id-crop';
  const isFaceVerify = solutionType === 'face-verify';
  const isFaceCrop = solutionType === 'face-cropping';

  // Get the appropriate API hook based on solution type
  const getCurrentApi = () => {
    switch (solutionType) {
      case 'qr-extract':
        return qrExtract;
      case 'signature-verification':
        return signatureVerify;
      case 'id-crop':
        return idCrop;
      case 'face-verify':
        return faceVerify;
      case 'face-cropping':
        return faceCrop;
      default:
        console.error('No matching API found for solution type:', solutionType);
        return qrExtract; // fallback
    }
  };

  const currentApi = getCurrentApi();

  // Convert base64 to downloadable image
  const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Download image from base64
  const downloadBase64Image = (base64: string, filename: string = 'processed-image.png') => {
    try {
      const blob = base64ToBlob(base64);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
    // For signature verification, limit to 2 files
    if (isSignatureVerification && uploadedFiles.length > 2) {
      alert('Please upload only 2 images for signature verification');
      return;
    }
    
    setFiles(uploadedFiles);
    // Reset any previous API states
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
          await signatureVerify.execute(base64Images);
          break;
          
        case 'qr-extract':
          const qrBase64 = await fileToBase64(files[0]);
          console.log('Calling QR extract API');
          await qrExtract.execute(qrBase64);
          break;
          
        case 'id-crop':
          const idBase64 = await fileToBase64(files[0]);
          console.log('Calling ID crop API');
          await idCrop.execute(idBase64);
          break;
          
        case 'face-verify':
          const faceVerifyBase64 = await fileToBase64(files[0]);
          console.log('Calling face verify API');
          await faceVerify.execute(faceVerifyBase64);
          break;
          
        case 'face-cropping':
          const faceCropBase64 = await fileToBase64(files[0]);
          console.log('Calling face crop API');
          await faceCrop.execute(faceCropBase64);
          break;
          
        default:
          console.error('Unknown solution type in handleSubmit:', solutionType);
          throw new Error(`Unsupported solution type: ${solutionType}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const copyToClipboard = (text: string, isBase64: boolean = false) => {
    navigator.clipboard.writeText(text).then(() => {
      if (isBase64) {
        setCopiedBase64(true);
        setTimeout(() => setCopiedBase64(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }).catch(err => {
      console.error('Failed to copy text:', err);
      alert('Failed to copy to clipboard');
    });
  };

  // Get the masked base64 from response (for QR Extract and other image processing)
  const getMaskedBase64 = () => {
    const data = currentApi.data?.data;
    const cropResult = currentApi.data?.cropResult;
    
    console.log('Getting masked base64 for solution type:', solutionType);
    console.log('API data:', data);
    console.log('Crop result:', cropResult);
    
    if (isQRExtract) {
      return data?.qrResult?.masked_base64 || data?.masked_base64;
    }
    
    // For ID Crop, check the cropResult structure first
    if (isIdCrop) {
      // Check cropResult.result first (based on your API response)
      if (cropResult?.result) {
        return cropResult.result;
      }
      // Fallback to other possible locations
      return data?.cropResult?.result || data?.result || data?.processed_image;
    }
    
    // For Face Cropping
    if (isFaceCrop) {
      return data?.processed_image || data?.result_image || data?.cropped_face;
    }
    
    // For Face Verify
    if (isFaceVerify) {
      return data?.processed_image || data?.result_image;
    }
    
    // For other solutions that might return processed images
    return data?.processed_image || data?.result_image || data?.masked_base64;
  };

  const maskedBase64 = getMaskedBase64();

  // Get file requirement text
  const getFileRequirementText = () => {
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

  const getProcessingMessage = () => {
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

  const getButtonText = () => {
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

  const getDownloadFileName = () => {
    const timestamp = Date.now();
    const baseName = files[0]?.name?.replace(/\.[^/.]+$/, "") || 'processed';
    
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Try the {solution.title}
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {getFileRequirementText()}. No registration required for demo.
          </p>
          {/* Debug info - remove in production */}
          <div className="mt-4 text-sm text-gray-500">
            Debug: Solution Type = {solutionType} | Slug = {solution.slug}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - File Upload */}
          <div className="space-y-6">
            {/* File Upload Component */}
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
              <FileUpload onChange={handleFileUpload} />
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
                          onClick={handleSubmit}
                          disabled={currentApi.loading || (isSignatureVerification && files.length !== 2)}
                          className={`px-6 py-2 bg-gradient-to-r ${solution.gradient} rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {currentApi.loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>{getButtonText()}</span>
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

          {/* Right Side - Response */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">API Response</h3>
              
              {!currentApi.data && !currentApi.loading && !currentApi.error && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">
                    {getFileRequirementText()} to see the API response
                  </p>
                </div>
              )}

              {currentApi.loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">{getProcessingMessage()}</p>
                </div>
              )}

              {currentApi.error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                    <h4 className="font-semibold text-red-400">Error</h4>
                  </div>
                  <p className="text-red-300 text-sm">{currentApi.error}</p>
                </div>
              )}

              {currentApi.data && (
                <div className="bg-black rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    {JSON.stringify(currentApi.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Processed Image Actions - Show if we have processed image */}
            {maskedBase64 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Processed Image</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Preview Image */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Preview:</p>
                    <div className="max-w-full max-h-64 overflow-hidden rounded-lg bg-gray-700 flex items-center justify-center">
                      <img 
                        src={`data:image/png;base64,${maskedBase64}`} 
                        alt="Processed Image" 
                        className="max-w-full max-h-64 object-contain"
                        onError={(e) => {
                          console.error('Failed to load image preview');
                          console.log('Base64 length:', maskedBase64.length);
                          console.log('Base64 preview:', maskedBase64.substring(0, 100) + '...');
                        }}
                        onLoad={() => console.log('Image loaded successfully')}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => copyToClipboard(maskedBase64, true)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-300"
                    >
                      {copiedBase64 ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Base64 Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Base64</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadBase64Image(maskedBase64, getDownloadFileName())}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Image</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Base64 length: {maskedBase64.length.toLocaleString()} characters
                  </div>
                </div>
              </div>
            )}

            {/* Response Details */}
            {currentApi.data && currentApi.data.success && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Response Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={currentApi.data.success ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                      {currentApi.data.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  {currentApi.data.data?.processing_time && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Processing Time:</span>
                      <span className="text-white font-medium">{currentApi.data.data.processing_time}</span>
                    </div>
                  )}
                  {currentApi.data.data?.file_names && isSignatureVerification ? (
                    <div className="space-y-1">
                      <span className="text-gray-400">Files:</span>
                      {currentApi.data.data.file_names.map((name: string, index: number) => (
                        <div key={index} className="flex justify-between ml-4">
                          <span className="text-gray-400">Signature {index + 1}:</span>
                          <span className="text-white font-medium">{name}</span>
                        </div>
                      ))}
                    </div>
                  ) : currentApi.data.data?.file_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Name:</span>
                      <span className="text-white font-medium">{currentApi.data.data.file_name}</span>
                    </div>
                  )}
                  {currentApi.data.remainingCredits && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Remaining Credits:</span>
                      <span className="text-white font-medium">{currentApi.data.remainingCredits}</span>
                    </div>
                  )}
                  {currentApi.data.req_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Request ID:</span>
                      <span className="text-white font-medium">{currentApi.data.req_id}</span>
                    </div>
                  )}
                  
                  {/* Show signature verification specific results */}
                  {isSignatureVerification && currentApi.data.data && (
                    <>
                      {currentApi.data.data.similarity_score && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Similarity Score:</span>
                          <span className="text-white font-medium">{(currentApi.data.data.similarity_score * 100).toFixed(2)}%</span>
                        </div>
                      )}
                      {typeof currentApi.data.data.is_match !== 'undefined' && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Match Result:</span>
                          <span className={currentApi.data.data.is_match ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                            {currentApi.data.data.is_match ? 'Match' : 'No Match'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show ID Crop specific results */}
                  {isIdCrop && currentApi.data?.cropResult && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Crop Status:</span>
                        <span className={currentApi.data.cropResult.success ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                          {currentApi.data.cropResult.status}
                        </span>
                      </div>
                      {currentApi.data.cropResult.message && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Message:</span>
                          <span className="text-white font-medium">{currentApi.data.cropResult.message}</span>
                        </div>
                      )}
                      {currentApi.data.cropResult.req_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Crop Request ID:</span>
                          <span className="text-white font-medium">{currentApi.data.cropResult.req_id}</span>
                        </div>
                      )}
                      {currentApi.data.cropResult.result && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Result Available:</span>
                          <span className="text-green-400 font-medium">✓ Cropped Image Ready</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show Face Verify specific results */}
                  {isFaceVerify && currentApi.data.data && (
                    <>
                      {currentApi.data.data.face_detected !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Face Detected:</span>
                          <span className={currentApi.data.data.face_detected ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                            {currentApi.data.data.face_detected ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                      {currentApi.data.data.confidence_score && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Confidence Score:</span>
                          <span className="text-white font-medium">{(currentApi.data.data.confidence_score * 100).toFixed(2)}%</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show Face Crop specific results */}
                  {isFaceCrop && currentApi.data.data && (
                    <>
                      {currentApi.data.data.faces_detected !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Faces Detected:</span>
                          <span className="text-white font-medium">{currentApi.data.data.faces_detected}</span>
                        </div>
                      )}
                      {currentApi.data.data.crop_successful !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Crop Successful:</span>
                          <span className={currentApi.data.data.crop_successful ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                            {currentApi.data.data.crop_successful ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show QR Extract specific results */}
                  {isQRExtract && currentApi.data.data?.qrResult && (
                    <>
                      {currentApi.data.data.qrResult.qr_count !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">QR Codes Found:</span>
                          <span className="text-white font-medium">{currentApi.data.data.qrResult.qr_count}</span>
                        </div>
                      )}
                      {currentApi.data.data.qrResult.qr_data && (
                        <div className="space-y-1">
                          <span className="text-gray-400">QR Data:</span>
                          {currentApi.data.data.qrResult.qr_data.map((data: string, index: number) => (
                            <div key={index} className="ml-4 p-2 bg-gray-800 rounded text-sm">
                              <span className="text-gray-400">QR {index + 1}:</span>
                              <span className="text-white ml-2">{data}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}