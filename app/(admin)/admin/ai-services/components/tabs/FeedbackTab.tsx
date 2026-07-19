'use client';

import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import type { AISaaSServiceRecord } from '../../../../lib/apiService';
import { formatDate, formatNumber } from '../../workbenchModel';
import { AdminSection, DataRow, MiniStat } from '../primitives';

/** Beta feedback and refund posture; the workflow lives on beta-feedback. */
export default function FeedbackTab({ service }: { service: AISaaSServiceRecord }) {
  const feedback = service.feedback;

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-2">
      <AdminSection title="Feedback summary">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Recent sessions" value={String(feedback.recentSessions)} />
          <MiniStat label="Pending" value={String(feedback.pendingSessions)} tone={feedback.pendingSessions > 0 ? 'warn' : 'normal'} />
          <MiniStat label="Refunded credits" value={formatNumber(feedback.refundedCredits)} />
          <MiniStat label="Last feedback" value={formatDate(feedback.lastCreatedAt)} />
        </div>
        <div className="mt-3 grid gap-1">
          <DataRow label="Source" value={feedback.source || 'aggregate'} />
        </div>
      </AdminSection>

      <AdminSection title="Workflow">
        <p className="text-sm text-gray-400">
          Review sessions, approve refunds, and reply to testers from the feedback workflow page.
        </p>
        <Link
          href="/admin/beta-feedback"
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-gray-100 transition hover:bg-white/[0.08]"
        >
          <MessageSquareText className="h-4 w-4" />
          Open beta feedback
        </Link>
      </AdminSection>
    </div>
  );
}
