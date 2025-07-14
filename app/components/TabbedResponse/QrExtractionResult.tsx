// components/TabbedResponseSection/QrExtractionResult.tsx
import React from 'react';
import { CheckCircle, QrCode, Info } from 'lucide-react';

interface QrExtractionResultProps {
  qrResult: any;
}

export const QrExtractionResult: React.FC<QrExtractionResultProps> = ({ qrResult }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed height */}
      <div className="text-center flex-shrink-0 mb-4 px-2">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">QR Code Extraction Result</h3>
      </div>

      {/* Main content - Flexible height */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 flex-1 min-h-0">
        <div className="space-y-3 h-full flex flex-col">
          
          {/* Extracted Data Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-gray-700 gap-2">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <QrCode className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 font-medium text-sm">Extracted Data:</span>
            </div>
            <div className="sm:max-w-[60%] lg:max-w-[70%] xl:max-w-[75%]">
              <span className="font-semibold text-blue-400 text-sm block break-all leading-relaxed">
                {qrResult.result?.replace('QR code data: ', '') || 'No data found'}
              </span>
            </div>
          </div>
          
          {/* Message Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 gap-2">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 font-medium text-sm">Message:</span>
            </div>
            <div className="sm:max-w-[60%] lg:max-w-[70%] xl:max-w-[75%]">
              <span className="font-semibold text-green-400 text-sm block break-words leading-relaxed">
                {qrResult.message}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar - Fixed height */}
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 flex-shrink-0 mt-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <QrCode className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Extraction Status:</span>
          </div>
          <span className="font-semibold text-green-400 text-sm text-center sm:text-left">
            Completed Successfully
          </span>
        </div>
      </div>
    </div>
  );
};