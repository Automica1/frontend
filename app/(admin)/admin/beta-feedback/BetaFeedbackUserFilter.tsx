'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Users, X } from 'lucide-react';
import type { BetaFeedbackSessionInfo } from '../../lib/apiService';

export type BetaFeedbackUserOption = {
  key: string;
  email: string;
  userId: string;
  sessionCount: number;
};

export function getSessionUserKey(session: BetaFeedbackSessionInfo): string {
  if (session.userId?.trim()) return session.userId.trim();
  if (session.email?.trim()) return session.email.trim().toLowerCase();
  return '';
}

export function buildUserOptions(sessions: BetaFeedbackSessionInfo[]): BetaFeedbackUserOption[] {
  const counts = new Map<string, BetaFeedbackUserOption>();

  for (const session of sessions) {
    const key = getSessionUserKey(session);
    if (!key) continue;

    const existing = counts.get(key);
    if (existing) {
      existing.sessionCount += 1;
      continue;
    }

    counts.set(key, {
      key,
      email: session.email || key,
      userId: session.userId || '',
      sessionCount: 1,
    });
  }

  return Array.from(counts.values()).sort((a, b) => a.email.localeCompare(b.email));
}

interface BetaFeedbackUserFilterProps {
  sessions: BetaFeedbackSessionInfo[];
  selectedUserKeys: Set<string>;
  onChange: (next: Set<string>) => void;
}

export default function BetaFeedbackUserFilter({
  sessions,
  selectedUserKeys,
  onChange,
}: BetaFeedbackUserFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const userOptions = useMemo(() => buildUserOptions(sessions), [sessions]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return userOptions;
    return userOptions.filter(
      (option) =>
        option.email.toLowerCase().includes(normalized) ||
        option.userId.toLowerCase().includes(normalized)
    );
  }, [query, userOptions]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const label =
    selectedUserKeys.size === 0
      ? 'All users'
      : selectedUserKeys.size === 1
        ? userOptions.find((option) => selectedUserKeys.has(option.key))?.email || '1 user'
        : `${selectedUserKeys.size} users`;

  const toggleUser = (key: string, checked: boolean) => {
    const next = new Set(selectedUserKeys);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    onChange(next);
  };

  const selectAllVisible = () => {
    const next = new Set(selectedUserKeys);
    filteredOptions.forEach((option) => next.add(option.key));
    onChange(next);
  };

  const clearSelection = () => {
    onChange(new Set());
    setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-w-[9rem] items-center justify-between gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
      >
        <span className="inline-flex items-center gap-2 truncate">
          <Users className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-gray-700 bg-gray-950 shadow-xl">
          <div className="border-b border-gray-800 p-3 space-y-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users…"
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500/40"
            />
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={selectAllVisible}
                className="text-blue-300 hover:text-blue-200"
              >
                Select visible
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {userOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No users in loaded sessions.</p>
            ) : filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No users match your search.</p>
            ) : (
              filteredOptions.map((option) => {
                const checked = selectedUserKeys.has(option.key);
                return (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleUser(option.key, e.target.checked)}
                      className="mt-0.5 rounded border-gray-600 bg-gray-900"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-100">{option.email}</span>
                      {option.userId ? (
                        <span className="block truncate text-xs text-gray-500">{option.userId}</span>
                      ) : null}
                      <span className="block text-xs text-gray-500">
                        {option.sessionCount} session{option.sessionCount === 1 ? '' : 's'}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
