'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Trash2 } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'default';
};

type AdminFeedbackContextType = {
  toast: (toast: Omit<Toast, 'id'>) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const AdminFeedbackContext = createContext<AdminFeedbackContextType | null>(null);

export function AdminFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);
  const idRef = useRef(1);

  const toast = useCallback((entry: Omit<Toast, 'id'>) => {
    const id = idRef.current++;
    setToasts((current) => [...current, { ...entry, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toastItem) => toastItem.id !== id));
    }, 3500);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <AdminFeedbackContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[70] flex w-[min(92vw,22rem)] flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-2xl border border-white/10 bg-black/80 px-4 py-3 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {item.tone === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                {item.tone === 'error' && <AlertCircle className="h-5 w-5 text-rose-300" />}
                {item.tone === 'info' && <Info className="h-5 w-5 text-sky-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.message && <p className="mt-1 text-xs leading-relaxed text-gray-300">{item.message}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-[24px] border border-white/10 bg-black/90 p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{confirmState.options.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{confirmState.options.message}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
                className="rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-400"
              >
                {confirmState.options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const context = useContext(AdminFeedbackContext);
  if (!context) {
    throw new Error('useAdminFeedback must be used within AdminFeedbackProvider');
  }
  return context;
}
