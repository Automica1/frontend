'use client';

import React from 'react';
import { MonitorSmartphone } from 'lucide-react';

interface BetaFeedbackDeviceBannerProps {
  compact?: boolean;
}

export default function BetaFeedbackDeviceBanner({ compact = false }: BetaFeedbackDeviceBannerProps) {
  return (
    <div
      className={`rounded-md border border-amber-500/30 bg-amber-950/15 ${
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
      }`}
    >
      <div className="flex items-start gap-2">
        <MonitorSmartphone className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-amber-200/90 leading-relaxed`}>
          Pending feedback is available on the device where you ran this test. Preview images are not
          stored on our servers.
        </p>
      </div>
    </div>
  );
}
