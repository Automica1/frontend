'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { MessageSquareText, RefreshCw } from 'lucide-react';
import {
  apiService,
  type BetaFeedbackSessionInfo,
} from '../../lib/apiService';

const statusStyles: Record<string, string> = {
  pending_feedback: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  refunded: 'text-green-300 bg-green-500/10 border-green-500/30',
};

export default function BetaFeedbackPage() {
  const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();
  const [sessions, setSessions] = useState<BetaFeedbackSessionInfo[]>([]);
  const [selectedService, setSelectedService] = useState('signature-verification');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadSessions();
  }, [authLoading, isAuthenticated, loadSessions]);

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
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
                <th className="px-4 py-3 font-medium">Actual</th>
                <th className="px-4 py-3 font-medium">Expected</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading sessions…
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No beta feedback sessions yet.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id || `${session.email}-${session.reqId}`} className="text-gray-300">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
