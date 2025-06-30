// components/ProcessedImageViewer.tsx
import React, { useState } from 'react';
import { Copy, Check, Download, Image as ImageIcon } from 'lucide-react';
import { SolutionType } from '../types/solution';
import { getDownloadFileName } from '../../utils/solutionHelpers';

interface ProcessedImageViewerProps {
  solutionType: SolutionType;
  base64Image: string;
  fileName?: string;
}

export const ProcessedImageViewer: React.FC<ProcessedImageViewerProps> = ({
  solutionType,
  base64Image,
  fileName
}) => {
  const [copiedBase64, setCopiedBase64] = useState(false);

  const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
      alert('Failed to copy to clipboard');
    });
  };

  return (
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
              src={`data:image/png;base64,${base64Image}`} 
              alt="Processed Image" 
              className="max-w-full max-h-64 object-contain"
              onError={(e) => {
                console.error('Failed to load image preview');
                console.log('Base64 length:', base64Image.length);
                console.log('Base64 preview:', base64Image.substring(0, 100) + '...');
              }}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => copyToClipboard(base64Image)}
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
            onClick={() => downloadBase64Image(base64Image, getDownloadFileName(solutionType, fileName))}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Download Image</span>
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Base64 length: {base64Image.length.toLocaleString()} characters
        </div>
      </div>
    </div>
  );
};