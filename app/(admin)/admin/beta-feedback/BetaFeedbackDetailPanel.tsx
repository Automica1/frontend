'use client';

import React, { useEffect } from 'react';
import { Loader2, X, ZoomIn } from 'lucide-react';
import type { BetaFeedbackSessionDetail } from '../../lib/apiService';
import {
  classificationsMatch,
  formatClassificationLabel,
} from '../../../(main)/lib/betaFeedbackConfig';

interface BetaFeedbackDetailPanelProps {
  sessionId: string;
  sessionDetail: BetaFeedbackSessionDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  onClose: () => void;
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function formatScore(value?: number) {
  if (typeof value !== 'number') return '—';
  return `${value.toFixed(1)}%`;
}

function expectedScore(detail: BetaFeedbackSessionDetail) {
  const min = detail.expectedResult?.expectedSimilarityMin;
  const max = detail.expectedResult?.expectedSimilarityMax;
  if (typeof min === 'number' && typeof max === 'number') {
    if (min === max) return formatScore(min);
    return `${min.toFixed(1)}–${max.toFixed(1)}%`;
  }
  if (typeof min === 'number') return formatScore(min);
  if (typeof max === 'number') return formatScore(max);
  return '—';
}

function toImageSrc(base64: string): string {
  if (base64.startsWith('data:')) return base64;
  return `data:image/jpeg;base64,${base64}`;
}

export default function BetaFeedbackDetailPanel({
  sessionId,
  sessionDetail,
  detailLoading,
  detailError,
  onClose,
}: BetaFeedbackDetailPanelProps) {
  const [zoomSrc, setZoomSrc] = React.useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomSrc) setZoomSrc(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, zoomSrc]);

  const match =
    sessionDetail?.actualResult?.classification &&
    sessionDetail?.expectedResult?.expectedClassification
      ? classificationsMatch(
          sessionDetail.actualResult.classification,
          sessionDetail.expectedResult.expectedClassification
        )
      : null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-end bg-black/65 p-4 backdrop-blur-sm md:items-stretch"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d10] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="beta-feedback-detail-title"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                Session detail
              </p>
              <h2 id="beta-feedback-detail-title" className="mt-2 text-xl font-semibold text-white truncate">
                {sessionDetail?.email || sessionId}
              </h2>
              {sessionDetail?.reqId && (
                <p className="text-xs text-gray-500 mt-1 truncate">{sessionDetail.reqId}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {detailLoading && (
              <div className="flex items-center gap-3 text-gray-300">
                <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
                <span className="text-sm">Loading session details…</span>
              </div>
            )}

            {detailError && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                {detailError}
              </div>
            )}

            {sessionDetail && (
              <>
                {match !== null && sessionDetail.status === 'refunded' && (
                  <div
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      match
                        ? 'border-green-500/30 bg-green-950/20 text-green-300'
                        : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
                    }`}
                  >
                    {match
                      ? 'User confirmed the model result matched their expectation.'
                      : 'User corrected the model result with different expected values.'}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailTile label="User" value={sessionDetail.email} subvalue={sessionDetail.userId} />
                  <DetailTile label="Service" value={sessionDetail.serviceName} />
                  <DetailTile label="Request ID" value={sessionDetail.reqId} />
                  <DetailTile
                    label="Beta key"
                    value={sessionDetail.betaKeyPrefix ? `${sessionDetail.betaKeyPrefix}…` : '—'}
                  />
                  <DetailTile label="Status" value={sessionDetail.status} />
                  <DetailTile
                    label="Run outcome"
                    value={sessionDetail.runOutcome || '—'}
                    subvalue={sessionDetail.failureMessage || undefined}
                  />
                  <DetailTile
                    label="Credits"
                    value={`Charged ${sessionDetail.creditsCharged}`}
                    subvalue={
                      sessionDetail.creditsRefunded
                        ? `Refunded ${sessionDetail.creditsRefunded}`
                        : 'Not refunded yet'
                    }
                  />
                  <DetailTile label="Created" value={formatDate(sessionDetail.createdAt)} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs font-medium text-gray-400 mb-2">Actual result</p>
                    <p className="text-sm text-gray-200">
                      {formatClassificationLabel(sessionDetail.actualResult?.classification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Score: {formatScore(sessionDetail.actualResult?.similarity_percentage)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <p className="text-xs font-medium text-gray-400 mb-2">Expected result</p>
                    <p className="text-sm text-gray-200">
                      {formatClassificationLabel(sessionDetail.expectedResult?.expectedClassification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Score: {expectedScore(sessionDetail)}</p>
                    {sessionDetail.expectedResult?.notes && (
                      <p className="text-xs text-gray-500 mt-2">{sessionDetail.expectedResult.notes}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 mb-3">Input images (server-stored for training)</p>
                  {sessionDetail.inputs && sessionDetail.inputs.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {sessionDetail.inputs.map((input, index) => {
                        const src = toImageSrc(input);
                        return (
                          <button
                            key={`${sessionDetail.id}-input-${index}`}
                            type="button"
                            onClick={() => setZoomSrc(src)}
                            className="group relative h-36 w-36 rounded-lg border border-gray-700 overflow-hidden bg-gray-900"
                          >
                            <img
                              src={src}
                              alt={`Input ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No input images stored for this session.</p>
                  )}
                </div>

                {(sessionDetail.feedbackSubmittedAt || sessionDetail.refundedAt) && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {sessionDetail.feedbackSubmittedAt && (
                      <p>Feedback submitted: {formatDate(sessionDetail.feedbackSubmittedAt)}</p>
                    )}
                    {sessionDetail.refundedAt && (
                      <p>Refunded: {formatDate(sessionDetail.refundedAt)}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {zoomSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setZoomSrc(null)}
          role="presentation"
        >
          <img
            src={zoomSrc}
            alt="Enlarged input"
            className="max-h-full max-w-full rounded-lg border border-gray-700 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function DetailTile({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm text-gray-200 mt-1 break-all">{value}</p>
      {subvalue && <p className="text-xs text-gray-500 mt-1 break-all">{subvalue}</p>}
    </div>
  );
}
