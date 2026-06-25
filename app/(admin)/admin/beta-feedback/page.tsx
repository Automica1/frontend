'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Loader2, MessageSquareText, RefreshCw, X } from 'lucide-react';
import {
  apiService,
  type BetaFeedbackSessionDetail,
  type BetaFeedbackSessionInfo,
} from '../../lib/apiService';

const statusStyles: Record<string, string> = {
  pending_feedback: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  refunded: 'text-green-300 bg-green-500/10 border-green-500/30',
};

const outcomeStyles: Record<string, string> = {
  completed: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  failed: 'text-red-300 bg-red-500/10 border-red-500/30',
};

function toImageSrc(base64: string): string {
  if (base64.startsWith('data:')) return base64;
  return `data:image/jpeg;base64,${base64}`;
}

export default function BetaFeedbackPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [sessions, setSessions] = useState<BetaFeedbackSessionInfo[]>([]);
  const [selectedService, setSelectedService] = useState('signature-verification');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<BetaFeedbackSessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listBetaFeedbackSessions(selectedService, 100);
      setSessions(response.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load beta feedback sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  const loadSessionDetail = useCallback(async (sessionId: string) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setSessionDetail(null);
      const response = await apiService.getBetaFeedbackSession(sessionId);
      setSessionDetail(response.session);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load session details');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadSessions();
  }, [authLoading, isAuthenticated, loadSessions]);

  useEffect(() => {
    if (!selectedSessionId) {
      setSessionDetail(null);
      setDetailError(null);
      return;
    }
    void loadSessionDetail(selectedSessionId);
  }, [loadSessionDetail, selectedSessionId]);

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const getOutcomeLabel = (session: BetaFeedbackSessionInfo) => {
    if (session.runOutcome) return session.runOutcome;
    if (session.status === 'refunded') return 'refunded';
    return '—';
  };

  const handleRowClick = (session: BetaFeedbackSessionInfo) => {
    if (!session.id) return;
    setSelectedSessionId(session.id);
  };

  const closeDetail = () => {
    setSelectedSessionId(null);
    setSessionDetail(null);
    setDetailError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-blue-400" />
            Beta Feedback Sessions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Review custom model test cases, expected labels, and refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
          >
            <option value="signature-verification">signature-verification</option>
          </select>
          <button
            type="button"
            onClick={loadSessions}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950/50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900/80 text-left text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Actual</th>
                <th className="px-4 py-3 font-medium">Expected</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading sessions…
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No beta feedback sessions yet.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const outcome = getOutcomeLabel(session);
                  return (
                    <tr
                      key={session.id || `${session.email}-${session.reqId}`}
                      onClick={() => handleRowClick(session)}
                      className={`text-gray-300 ${session.id ? 'cursor-pointer hover:bg-gray-900/60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-200">{session.email}</div>
                        <div className="text-xs text-gray-500">{session.reqId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                            statusStyles[session.status] || 'text-gray-300 border-gray-700'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {outcome !== '—' ? (
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${
                              outcomeStyles[outcome] || 'text-gray-300 border-gray-700'
                            }`}
                          >
                            {outcome}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {session.actualResult?.classification || '—'}
                        {typeof session.actualResult?.similarity_percentage === 'number'
                          ? ` (${session.actualResult.similarity_percentage.toFixed(1)}%)`
                          : ''}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {session.expectedResult?.expectedClassification || '—'}
                        {session.expectedResult?.notes ? (
                          <div className="text-gray-500 mt-0.5 truncate max-w-[200px]">
                            {session.expectedResult.notes}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        charged {session.creditsCharged}
                        {session.creditsRefunded ? ` · refunded ${session.creditsRefunded}` : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(session.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSessionId && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/65 p-4 backdrop-blur-sm md:items-stretch">
          <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d10] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                  Session detail
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{selectedSessionId}</h2>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailTile label="User" value={sessionDetail.email} subvalue={sessionDetail.userId} />
                    <DetailTile label="Request ID" value={sessionDetail.reqId} />
                    <DetailTile label="Status" value={sessionDetail.status} />
                    <DetailTile
                      label="Run outcome"
                      value={sessionDetail.runOutcome || '—'}
                      subvalue={sessionDetail.failureMessage}
                    />
                    <DetailTile
                      label="Credits"
                      value={`Charged ${sessionDetail.creditsCharged}`}
                      subvalue={
                        sessionDetail.creditsRefunded
                          ? `Refunded ${sessionDetail.creditsRefunded}`
                          : sessionDetail.status === 'refunded'
                            ? 'Refunded'
                            : 'Not refunded yet'
                      }
                    />
                    <DetailTile label="Created" value={formatDate(sessionDetail.createdAt)} />
                  </div>

                  {sessionDetail.failureMessage && (
                    <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3">
                      <p className="text-xs font-medium text-red-300 mb-1">Failure message</p>
                      <p className="text-sm text-red-200">{sessionDetail.failureMessage}</p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                      <p className="text-xs font-medium text-gray-400 mb-2">Actual result</p>
                      <p className="text-sm text-gray-200">
                        {sessionDetail.actualResult?.classification || '—'}
                        {typeof sessionDetail.actualResult?.similarity_percentage === 'number'
                          ? ` · ${sessionDetail.actualResult.similarity_percentage.toFixed(1)}%`
                          : ''}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                      <p className="text-xs font-medium text-gray-400 mb-2">Expected result</p>
                      <p className="text-sm text-gray-200">
                        {sessionDetail.expectedResult?.expectedClassification || '—'}
                      </p>
                      {sessionDetail.expectedResult?.notes && (
                        <p className="text-xs text-gray-500 mt-1">{sessionDetail.expectedResult.notes}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-3">Input images</p>
                    {sessionDetail.inputs && sessionDetail.inputs.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {sessionDetail.inputs.map((input, index) => (
                          <img
                            key={`${sessionDetail.id}-input-${index}`}
                            src={toImageSrc(input)}
                            alt={`Input ${index + 1}`}
                            className="h-32 w-32 rounded-lg border border-gray-700 object-cover bg-gray-900"
                          />
                        ))}
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
      )}
    </div>
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
