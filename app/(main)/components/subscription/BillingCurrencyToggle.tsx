'use client';

import React from 'react';
import {
  BillingCurrency,
  SUPPORTED_CURRENCIES,
} from '../../lib/billingCurrency';

type BillingCurrencyToggleProps = {
  value: BillingCurrency;
  onChange: (currency: BillingCurrency) => void;
  compact?: boolean;
};

const LABELS: Record<BillingCurrency, string> = {
  INR: '₹ INR',
  USD: '$ USD',
};

/** Minimal INR / USD switcher — no hints or text-link fallbacks. */
export function BillingCurrencyToggle({
  value,
  onChange,
  compact = true,
}: BillingCurrencyToggleProps) {
  return (
    <div
      className={`inline-flex rounded-full border border-white/10 bg-white/5 ${
        compact ? 'p-0.5' : 'p-1'
      }`}
      role="group"
      aria-label="Billing currency"
    >
      {SUPPORTED_CURRENCIES.map((currency) => {
        const selected = value === currency;
        return (
          <button
            key={currency}
            type="button"
            onClick={() => onChange(currency)}
            className={`rounded-full font-medium transition-colors ${
              compact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
            } ${
              selected
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            aria-pressed={selected}
          >
            {LABELS[currency]}
          </button>
        );
      })}
    </div>
  );
}
