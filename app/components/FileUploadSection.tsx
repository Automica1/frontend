// components/FileUploadSection.tsx
import React from 'react';
import { FileUpload } from '../components/ui/file-upload';
import { Solution, SolutionType } from '../types/solution';

interface FileUploadSectionProps {
  solution: Solution;
  solutionType: SolutionType;
  files: File[];
  onFileUpload: (files: File[]) => void;
}

// Helper function to truncate filename
const truncateFilename = (filename: string, maxLength = 25) => {
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop();
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
  
  return `${truncatedName}...${extension}`;
};

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  solution,
  solutionType,
  files,
  onFileUpload
}) => {
  const isSignatureVerification = solutionType === 'signature-verification';

  return (
    <div className="space-y-6">
      

      {/* File Upload Component */}
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={onFileUpload} />
      </div>
   
    </div>
  );
};

   {/* Instructions */}
      // <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      //   <div className="flex items-center space-x-3 mb-4">
      //     <div className={`w-10 h-10 bg-gradient-to-br ${solution.gradient} rounded-lg flex items-center justify-center`}>
      //       <solution.IconComponent className="w-5 h-5 text-white" />
      //     </div>
      //     <div>
      //       <h3 className="text-lg font-semibold text-white">Upload Files</h3>
      //       <p className="text-sm text-gray-400">
      //         {isSignatureVerification ? 'Upload 2 signature images to compare' : 'Upload your image files'}
      //       </p>
      //     </div>
      //   </div>

      //   {/* Requirements */}
      //   <div className="bg-gray-800 rounded-lg p-4">
      //     <h4 className="font-medium text-gray-300 mb-2">Requirements:</h4>
      //     <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
      //       {isSignatureVerification ? (
      //         <>
      //           <li>Upload exactly 2 signature images</li>
      //           <li>Images should be clear and well-lit</li>
      //           <li>Both signatures should be on white/light backgrounds</li>
      //         </>
      //       ) : (
      //         <>
      //           <li>Upload clear, high-quality images</li>
      //           <li>Images should be well-lit and in focus</li>
      //           <li>Avoid blurry or low-resolution images</li>
      //         </>
      //       )}
      //       <li>Supported formats: JPG, PNG, JPEG</li>
      //       <li>Maximum file size: 10MB per image</li>
      //     </ul>
      //   </div>
      // </div>