// components/ResponseDetails.tsx
import React from 'react';
import { SolutionType } from '../types/solution';

interface ResponseDetailsProps {
  solutionType: SolutionType;
  data: any;
}

export const ResponseDetails: React.FC<ResponseDetailsProps> = ({ solutionType, data }) => {
  if (!data || !data.success) return null;

  const isSignatureVerification = solutionType === 'signature-verification';
  const isIdCrop = solutionType === 'id-crop';
  const isFaceVerify = solutionType === 'face-verify';
  const isFaceCrop = solutionType === 'face-cropping';
  const isQRExtract = solutionType === 'qr-extract';

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4">Response Details</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={data.success ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
            {data.success ? 'Success' : 'Error'}
          </span>
        </div>
        
        {data.data?.processing_time && (
          <div className="flex justify-between">
            <span className="text-gray-400">Processing Time:</span>
            <span className="text-white font-medium">{data.data.processing_time}</span>
          </div>
        )}
        
        {data.data?.file_names && isSignatureVerification ? (
          <div className="space-y-1">
            <span className="text-gray-400">Files:</span>
            {data.data.file_names.map((name: string, index: number) => (
              <div key={index} className="flex justify-between ml-4">
                <span className="text-gray-400">Signature {index + 1}:</span>
                <span className="text-white font-medium">{name}</span>
              </div>
            ))}
          </div>
        ) : data.data?.file_name && (
          <div className="flex justify-between">
            <span className="text-gray-400">File Name:</span>
            <span className="text-white font-medium">{data.data.file_name}</span>
          </div>
        )}
        
        {data.remainingCredits && (
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining Credits:</span>
            <span className="text-white font-medium">{data.remainingCredits}</span>
          </div>
        )}
        
        {data.req_id && (
          <div className="flex justify-between">
            <span className="text-gray-400">Request ID:</span>
            <span className="text-white font-medium">{data.req_id}</span>
          </div>
        )}
        
        {/* Signature Verification Results */}
        {isSignatureVerification && data.data && (
          <>
            {data.data.similarity_score && (
              <div className="flex justify-between">
                <span className="text-gray-400">Similarity Score:</span>
                <span className="text-white font-medium">{(data.data.similarity_score * 100).toFixed(2)}%</span>
              </div>
            )}
            {typeof data.data.is_match !== 'undefined' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Match Result:</span>
                <span className={data.data.is_match ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                  {data.data.is_match ? 'Match' : 'No Match'}
                </span>
              </div>
            )}
          </>
        )}
        
        {/* ID Crop Results */}
        {isIdCrop && data.cropResult && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Crop Status:</span>
              <span className={data.cropResult.success ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                {data.cropResult.status}
              </span>
            </div>
            {data.cropResult.message && (
              <div className="flex justify-between">
                <span className="text-gray-400">Message:</span>
                <span className="text-white font-medium">{data.cropResult.message}</span>
              </div>
            )}
            {data.cropResult.result && (
              <div className="flex justify-between">
                <span className="text-gray-400">Result Available:</span>
                <span className="text-green-400 font-medium">✓ Cropped Image Ready</span>
              </div>
            )}
          </>
        )}
        
        {/* Face Verify Results */}
        {isFaceVerify && data.data && (
          <>
            {data.data.face_detected !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Face Detected:</span>
                <span className={data.data.face_detected ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                  {data.data.face_detected ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            {data.data.confidence_score && (
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence Score:</span>
                <span className="text-white font-medium">{(data.data.confidence_score * 100).toFixed(2)}%</span>
              </div>
            )}
          </>
        )}
        
        {/* Face Crop Results */}
        {isFaceCrop && data.data && (
          <>
            {data.data.faces_detected !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Faces Detected:</span>
                <span className="text-white font-medium">{data.data.faces_detected}</span>
              </div>
            )}
            {data.data.crop_successful !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Crop Successful:</span>
                <span className={data.data.crop_successful ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                  {data.data.crop_successful ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </>
        )}
        
        {/* QR Extract Results */}
        {isQRExtract && data.data?.qrResult && (
          <>
            {data.data.qrResult.qr_count !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">QR Codes Found:</span>
                <span className="text-white font-medium">{data.data.qrResult.qr_count}</span>
              </div>
            )}
            {data.data.qrResult.qr_data && (
              <div className="space-y-1">
                <span className="text-gray-400">QR Data:</span>
                {data.data.qrResult.qr_data.map((qrData: string, index: number) => (
                  <div key={index} className="ml-4 p-2 bg-gray-800 rounded text-sm">
                    <span className="text-gray-400">QR {index + 1}:</span>
                    <span className="text-white ml-2">{qrData}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
