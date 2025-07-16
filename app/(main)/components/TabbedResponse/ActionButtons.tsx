// components/TabbedResponseSection/ActionButtons.tsx
import React from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface ActionButtonsProps {
  onCopyBase64: () => void;
  onDownloadImage: () => void;
  copiedBase64: boolean;
  base64Length: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopyBase64,
  onDownloadImage,
  copiedBase64,
  base64Length
}) => {
  return (
    <div className="space-y-4 flex-shrink-0">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCopyBase64}
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
          onClick={onDownloadImage}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-300"
        >
          <Download className="w-4 h-4" />
          <span>Download Image</span>
        </button>
      </div>

      {/* Base64 Length Info */}
      <div className="text-xs text-gray-500">
        Base64 length: {base64Length.toLocaleString()} characters
      </div>
    </div>
  );
};