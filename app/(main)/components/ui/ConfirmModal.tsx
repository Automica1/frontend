'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: 'default' | 'danger';
  singleAction?: boolean;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'default',
  singleAction = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [loading, onCancel, open]);

  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-amber-500/20 border-amber-500/30 text-amber-200 hover:bg-amber-500/30'
      : 'bg-purple-500/20 border-purple-500/30 text-purple-200 hover:bg-purple-500/30';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c1018] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <h2 id="confirm-modal-title" className="text-lg font-medium text-white pr-8">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 text-sm leading-relaxed text-gray-400">{description}</div>

        <div className={`flex gap-3 border-t border-white/10 px-6 py-4 ${singleAction ? 'justify-end' : ''}`}>
          {!singleAction && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${singleAction ? 'min-w-[8rem]' : 'flex-1'} rounded-xl border py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${confirmClasses}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
