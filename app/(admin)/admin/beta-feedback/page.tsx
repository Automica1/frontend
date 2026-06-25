'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Loader2, MessageSquareText, RefreshCw } from 'lucide-react';
import {
  apiService,
  type BetaFeedbackSessionInfo,
} from '../../lib/apiService';
import BetaFeedbackDetailPanel from './BetaFeedbackDetailPanel';
import {
  classificationsMatch,
  formatClassificationLabel,
} from '../../../(main)/lib/betaFeedbackConfig';

const statusStyles: Record<string, string> = {
  pending_feedback: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  refunded: 'text-green-300 bg-green-500/10 border-green-500/30',
};

const outcomeStyles: Record<string, string> = {
  completed: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  failed: 'text-red-300 bg-red-500/10 border-red-500/30',
};

export default function BetaFeedbackPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [sessions, setSessions] = useState<BetaFeedbackSessionInfo[]>([]);
  const [services, setServices] = useState<string[]>(['signature-verification']);
  const [selectedService, setSelectedService] = useState('signature-verification');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_feedback' | 'refunded'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<Awaited<
    ReturnType<typeof apiService.getBetaFeedbackSession>
  >['session'] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    void apiService.getSupportedBetaServices().then((res) => {
      if (res.services?.length) {
        setServices(res.services);
      }
    });
  }, [isAuthenticated]);

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

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;
      if (outcomeFilter !== 'all' && session.runOutcome !== outcomeFilter) return false;
      return true;
    });
  }, [outcomeFilter, sessions, statusFilter]);

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
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
          >
            <option value="all">All statuses</option>
            <option value="pending_feedback">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as typeof outcomeFilter)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
          >
            <option value="all">All outcomes</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
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
                <th className="px-4 py-3 font-medium">Match</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                    Loading sessions…
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No beta feedback sessions match your filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const outcome = getOutcomeLabel(session);
                  const matched =
                    session.actualResult?.classification &&
                    session.expectedResult?.expectedClassification
                      ? classificationsMatch(
                          session.actualResult.classification,
                          session.expectedResult.expectedClassification
                        )
                      : null;
                  const isSelected = session.id === selectedSessionId;
                  return (
                    <tr
                      key={session.id || `${session.email}-${session.reqId}`}
                      onClick={() => handleRowClick(session)}
                      className={`text-gray-300 ${
                        session.id ? 'cursor-pointer hover:bg-gray-900/60' : ''
                      } ${isSelected ? 'bg-blue-950/30' : ''}`}
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
                        {formatClassificationLabel(session.actualResult?.classification)}
                        {typeof session.actualResult?.similarity_percentage === 'number'
                          ? ` (${session.actualResult.similarity_percentage.toFixed(1)}%)`
                          : ''}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatClassificationLabel(session.expectedResult?.expectedClassification)}
                        {session.expectedResult?.notes ? (
                          <div className="text-gray-500 mt-0.5 truncate max-w-[180px]" title={session.expectedResult.notes}>
                            {session.expectedResult.notes}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {matched === null ? (
                          <span className="text-gray-500">—</span>
                        ) : matched ? (
                          <span className="text-green-400">Match</span>
                        ) : (
                          <span className="text-amber-400">Corrected</span>
                        )}
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
        <BetaFeedbackDetailPanel
          sessionId={selectedSessionId}
          sessionDetail={sessionDetail}
          detailLoading={detailLoading}
          detailError={detailError}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
