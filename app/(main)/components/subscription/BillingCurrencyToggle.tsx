'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BillingCurrency,
  SUPPORTED_CURRENCIES,
  currencyLabel,
  currencyToggleHint,
} from '../../lib/billingCurrency';

type BillingCurrencyToggleProps = {
  value: BillingCurrency;
  onChange: (currency: BillingCurrency) => void;
  likelyIndian?: boolean;
  lockedCurrency?: BillingCurrency | null;
};

export function BillingCurrencyToggle({
  value,
  onChange,
  likelyIndian = false,
  lockedCurrency = null,
}: BillingCurrencyToggleProps) {
  if (lockedCurrency) {
    return (
      <p className="text-xs text-gray-500 text-center">
        Billed in {currencyLabel(lockedCurrency)} — currency is locked to your subscription.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-500">{currencyToggleHint(likelyIndian, value)}</p>
      <div
        className="relative inline-grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1"
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
              className={`relative z-10 px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                selected ? 'text-purple-100' : 'text-gray-400 hover:text-gray-200'
              }`}
              aria-pressed={selected}
            >
              {selected && (
                <motion.span
                  layoutId="billing-currency-pill"
                  className="absolute inset-0 rounded-full bg-purple-500/25 border border-purple-400/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">{currencyLabel(currency)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
