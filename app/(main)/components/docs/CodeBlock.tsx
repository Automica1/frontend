// components/CodeBlock.tsx
import React from 'react';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  copyId: string;
  copied: string;
  onCopy: (text: string, id: string) => void;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, copyId, copied, onCopy, className = "" }) => (
  <div className={`bg-black rounded-lg p-3 sm:p-4 relative ${className}`}>
    <CopyButton
      text={code}
      id={copyId}
      copied={copied}
      onCopy={onCopy}
      className="absolute top-2 right-2"
    />
    <pre className="text-xs sm:text-sm text-gray-300 font-mono pr-8 sm:pr-12 overflow-x-auto">
      {code}
    </pre>
  </div>
);
