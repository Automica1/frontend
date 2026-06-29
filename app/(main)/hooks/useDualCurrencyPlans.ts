'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiService, Plan } from '../lib/apiService';
import {
  BillingCurrency,
  detectBillingCurrency,
  isLikelyIndianUser,
  normalizeBillingCurrency,
  persistBillingCurrency,
  resolvePlanForCurrency,
} from '../lib/billingCurrency';

type UseDualCurrencyPlansOptions = {
  phone?: string | null;
  subscriptionCurrency?: string | null;
};

export function useDualCurrencyPlans(options: UseDualCurrencyPlansOptions = {}) {
  const lockedCurrency = normalizeBillingCurrency(options.subscriptionCurrency);
  const isLocked = Boolean(lockedCurrency);

  const [billingCurrency, setBillingCurrency] = useState<BillingCurrency>(() =>
    detectBillingCurrency({
      phone: options.phone,
      subscriptionCurrency: options.subscriptionCurrency,
    })
  );
  const [rawPlans, setRawPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const likelyIndian = useMemo(
    () => isLikelyIndianUser({ phone: options.phone }),
    [options.phone]
  );

  useEffect(() => {
    setBillingCurrency(
      detectBillingCurrency({
        phone: options.phone,
        subscriptionCurrency: options.subscriptionCurrency,
      })
    );
  }, [options.phone, options.subscriptionCurrency]);

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await apiService.getActivePlans();
        if (!cancelled) {
          setRawPlans(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load plans', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCurrency = lockedCurrency ?? billingCurrency;

  const plans = useMemo(() => {
    return rawPlans
      .map((plan) => resolvePlanForCurrency(plan, activeCurrency))
      .filter((plan): plan is Plan => plan !== null)
      .sort((a, b) => a.price - b.price);
  }, [rawPlans, activeCurrency]);

  const setCurrency = (currency: BillingCurrency) => {
    if (isLocked) return;
    setBillingCurrency(currency);
    persistBillingCurrency(currency);
  };

  return {
    plans,
    billingCurrency: activeCurrency,
    setCurrency,
    loading,
    isLocked,
    likelyIndian,
    showCurrencyToggle: !isLocked,
  };
}
