'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { ChevronDown, Download, Loader2, MessageSquareText, RefreshCw } from 'lucide-react';
import {
  apiService,
  type BetaFeedbackSessionInfo,
} from '../../lib/apiService';
import BetaFeedbackDetailPanel from './BetaFeedbackDetailPanel';
import BetaFeedbackUserFilter, {
  buildUserOptions,
  getSessionUserKey,
} from './BetaFeedbackUserFilter';
import {
  buildAndDownloadTrainingZip,
  type ExportFilterContext,
} from './betaFeedbackExport';
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
  const [selectedUserKeys, setSelectedUserKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
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

  const loadSessions = useCallback(async (limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.listBetaFeedbackSessions(selectedService, limit);
      setSessions(response.sessions || []);
      setSelectedSessionIds(new Set());
      setSelectedUserKeys(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load beta feedback sessions');
      setSessions([]);
      setSelectedSessionIds(new Set());
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

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const userOptions = useMemo(() => buildUserOptions(sessions), [sessions]);

  useEffect(() => {
    const validKeys = new Set(userOptions.map((option) => option.key));
    setSelectedUserKeys((current) => {
      const next = new Set([...current].filter((key) => validKeys.has(key)));
      return next.size === current.size ? current : next;
    });
  }, [userOptions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;
      if (outcomeFilter !== 'all' && session.runOutcome !== outcomeFilter) return false;
      if (selectedUserKeys.size > 0) {
        const userKey = getSessionUserKey(session);
        if (!userKey || !selectedUserKeys.has(userKey)) return false;
      }
      return true;
    });
  }, [outcomeFilter, selectedUserKeys, sessions, statusFilter]);

  const filteredSessionIds = useMemo(
    () =>
      filteredSessions
        .map((session) => session.id)
        .filter((id): id is string => Boolean(id)),
    [filteredSessions]
  );

  const allFilteredSelected =
    filteredSessionIds.length > 0 &&
    filteredSessionIds.every((id) => selectedSessionIds.has(id));

  const selectedCount = selectedSessionIds.size;

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  const getOutcomeLabel = (session: BetaFeedbackSessionInfo) => {
    if (session.runOutcome) return session.runOutcome;
    if (session.status === 'refunded') return 'refunded';
    return '—';
  };

  const toggleSessionSelection = (sessionId: string, checked: boolean) => {
    setSelectedSessionIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(sessionId);
      } else {
        next.delete(sessionId);
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = (checked: boolean) => {
    if (!checked) {
      setSelectedSessionIds(new Set());
      return;
    }
    setSelectedSessionIds(new Set(filteredSessionIds));
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

  const buildExportContext = (
    scope: ExportFilterContext['scope']
  ): ExportFilterContext => {
    const selectedUsers = userOptions.filter((option) => selectedUserKeys.has(option.key));
    return {
      serviceName: selectedService,
      scope,
      statusFilter,
      outcomeFilter,
      selectedUserCount: selectedUserKeys.size,
      selectedUserEmail: selectedUsers.length === 1 ? selectedUsers[0].email : undefined,
    };
  };

  const runExport = async (
    scope: ExportFilterContext['scope'],
    sessionsToExport: BetaFeedbackSessionInfo[],
    prefetchedDetails: Awaited<ReturnType<typeof apiService.getBetaFeedbackSession>>['session'][] = []
  ) => {
    if (sessionsToExport.length === 0) {
      setError('No sessions available to export.');
      return;
    }

    setExporting(true);
    setExportProgress(`Preparing ${sessionsToExport.length} session(s)…`);
    setError(null);
    try {
      await buildAndDownloadTrainingZip(
        sessionsToExport,
        async (sessionId) => (await apiService.getBetaFeedbackSession(sessionId)).session,
        buildExportContext(scope),
        prefetchedDetails.filter(Boolean) as Awaited<
          ReturnType<typeof apiService.getBetaFeedbackSession>
        >['session'][]
      );
      setExportMenuOpen(false);
      setExportProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export beta feedback');
      setExportProgress(null);
    } finally {
      setExporting(false);
    }
  };

  const handleExportSelected = () => {
    const selected = filteredSessions.filter(
      (session) => session.id && selectedSessionIds.has(session.id)
    );
    void runExport('selected', selected);
  };

  const handleExportFiltered = () => {
    void runExport('filtered', filteredSessions);
  };

  const handleExportAllForService = async () => {
    setExporting(true);
    setExportProgress('Loading all sessions for service…');
    setError(null);
    try {
      const response = await apiService.listBetaFeedbackSessions(selectedService, 500);
      await runExport('service', response.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export beta feedback for service');
      setExporting(false);
      setExportProgress(null);
    }
  };

  const handleExportCurrentSession = () => {
    if (!sessionDetail?.id) return;
    void runExport(
      'selected',
      [{ ...sessionDetail, id: sessionDetail.id }],
      [sessionDetail]
    );
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
            Review custom model test cases and export full-resolution inputs with predicted/expected labels for AI training.
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
          <BetaFeedbackUserFilter
            sessions={sessions}
            selectedUserKeys={selectedUserKeys}
            onChange={setSelectedUserKeys}
          />
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
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportMenuOpen((open) => !open)}
              disabled={loading || exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-100 hover:bg-blue-500/20 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export ZIP
              <ChevronDown className="h-4 w-4" />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-lg border border-gray-700 bg-gray-950 shadow-xl">
                <div className="border-b border-gray-800 px-4 py-2 text-xs text-gray-500">
                  Downloads a ZIP with full-res inputs, manifest.csv, and labels.json
                </div>
                <button
                  type="button"
                  onClick={handleExportSelected}
                  disabled={selectedCount === 0 || exporting}
                  className="block w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export selected ({selectedCount})
                </button>
                <button
                  type="button"
                  onClick={handleExportFiltered}
                  disabled={filteredSessions.length === 0 || exporting}
                  className="block w-full border-t border-gray-800 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export filtered view ({filteredSessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => void handleExportAllForService()}
                  disabled={exporting}
                  className="block w-full border-t border-gray-800 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export all for service ({selectedService})
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => loadSessions()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {exportProgress && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 px-4 py-3 text-sm text-blue-200">
          {exportProgress}
        </div>
      )}

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
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                    aria-label="Select all filtered sessions"
                    className="rounded border-gray-600 bg-gray-900"
                  />
                </th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Predicted</th>
                <th className="px-4 py-3 font-medium">Expected</th>
                <th className="px-4 py-3 font-medium">Match</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                    Loading sessions…
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
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
                  const isChecked = session.id ? selectedSessionIds.has(session.id) : false;
                  return (
                    <tr
                      key={session.id || `${session.email}-${session.reqId}`}
                      onClick={() => handleRowClick(session)}
                      className={`text-gray-300 ${
                        session.id ? 'cursor-pointer hover:bg-gray-900/60' : ''
                      } ${isSelected ? 'bg-blue-950/30' : ''}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!session.id}
                          onChange={(e) => {
                            if (!session.id) return;
                            toggleSessionSelection(session.id, e.target.checked);
                          }}
                          aria-label={`Select session ${session.reqId}`}
                          className="rounded border-gray-600 bg-gray-900"
                        />
                      </td>
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
                        {typeof session.expectedResult?.expectedSimilarityMin === 'number' ||
                        typeof session.expectedResult?.expectedSimilarityMax === 'number' ? (
                          <div className="text-gray-500 mt-0.5">
                            {typeof session.expectedResult?.expectedSimilarityMin === 'number' &&
                            typeof session.expectedResult?.expectedSimilarityMax === 'number'
                              ? session.expectedResult.expectedSimilarityMin ===
                                session.expectedResult.expectedSimilarityMax
                                ? `${session.expectedResult.expectedSimilarityMin.toFixed(1)}%`
                                : `${session.expectedResult.expectedSimilarityMin.toFixed(1)}–${session.expectedResult.expectedSimilarityMax.toFixed(1)}%`
                              : typeof session.expectedResult?.expectedSimilarityMin === 'number'
                                ? `${session.expectedResult.expectedSimilarityMin.toFixed(1)}%`
                                : `${session.expectedResult?.expectedSimilarityMax?.toFixed(1)}%`}
                          </div>
                        ) : null}
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
          onExport={handleExportCurrentSession}
          exportDisabled={!sessionDetail || exporting}
        />
      )}
    </div>
  );
}
