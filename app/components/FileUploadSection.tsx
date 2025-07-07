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
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-black border-neutral-800 rounded-lg">
        <FileUpload onChange={onFileUpload} />
      </div>
   
    </div>
  );
};
