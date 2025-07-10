// types/solution.ts
export interface Solution {
  title: string;
  IconComponent: React.ComponentType<any>;
  gradient: string;
  apiEndpoint?: string;
  slug?: string;
}

export type SolutionType = 'qr-extract' | 'signature-verification' | 'id-crop' | 'face-verify' | 'face-cropping' | 'qr-mask' | 'unknown';
