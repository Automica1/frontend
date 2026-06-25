'use client';

import React from 'react';
import { Coins, MessageSquareText } from 'lucide-react';

interface BetaFeedbackResultNudgeProps {
  creditsToRefund: number;
  onOpenFeedback: () => void;
  variant?: 'banner' | 'inline';
}

export default function BetaFeedbackResultNudge({
  creditsToRefund,
  onOpenFeedback,
  variant = 'inline',
}: BetaFeedbackResultNudgeProps) {
  if (variant === 'banner') {
    return (
      <div className="flex-shrink-0 border-b border-blue-500/30 bg-blue-950/40 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <Coins className="h-3.5 w-3.5 text-blue-300" />
          </span>
          <p className="min-w-0 flex-1 text-xs text-blue-100 leading-snug">
            <span className="font-medium">Earn {creditsToRefund} credits back</span>
            <span className="text-blue-200/80"> — rate whether this result was correct.</span>
          </p>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="flex-shrink-0 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            Rate now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-950/20 px-3 py-3">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/15">
          <MessageSquareText className="h-3.5 w-3.5 text-blue-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-blue-100">Still need to rate this result</p>
          <p className="mt-1 text-xs text-blue-200/80 leading-relaxed">
            Tell us if the API got it right — we&apos;ll credit back {creditsToRefund} credits.
          </p>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="mt-2.5 inline-flex items-center rounded-md border border-blue-500/40 bg-blue-600/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            Rate result
          </button>
        </div>
      </div>
    </div>
  );
}
