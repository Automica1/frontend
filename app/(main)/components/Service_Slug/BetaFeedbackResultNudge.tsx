'use client';

import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface BetaFeedbackResultNudgeProps {
  creditsToRefund: number;
  onOpenFeedback: () => void;
}

export default function BetaFeedbackResultNudge({
  creditsToRefund,
  onOpenFeedback,
}: BetaFeedbackResultNudgeProps) {
  return (
    <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-950/20 px-3 py-3">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/15">
          <MessageSquareText className="h-3.5 w-3.5 text-blue-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-blue-100">Help improve your custom model</p>
          <p className="mt-1 text-xs text-blue-200/80 leading-relaxed">
            Tell us if this API result was correct — we&apos;ll credit back {creditsToRefund} credits
            for your feedback.
          </p>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="mt-2.5 inline-flex items-center rounded-md border border-blue-500/40 bg-blue-600/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            Open feedback
          </button>
        </div>
      </div>
    </div>
  );
}
