'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService, Plan } from '../lib/apiService';
import {
  BillingCurrency,
  BillingRegionConfidence,
  detectBillingCurrency,
  getBillingRegionConfidence,
  normalizeBillingCurrency,
  persistBillingCurrency,
  resolvePlanForCurrency,
} from '../lib/billingCurrency';
import { sortPlans } from '../lib/planPresentation';

type UseDualCurrencyPlansOptions = {
  phone?: string | null;
  subscriptionCurrency?: string | null;
};

export function useDualCurrencyPlans(options: UseDualCurrencyPlansOptions = {}) {
  const searchParams = useSearchParams();
  const queryCurrency = searchParams?.get('currency') ?? null;

  const lockedCurrency = normalizeBillingCurrency(options.subscriptionCurrency);
  const isLocked = Boolean(options.subscriptionCurrency);

  const [billingCurrency, setBillingCurrency] = useState<BillingCurrency>(() =>
    detectBillingCurrency({
      phone: options.phone,
      subscriptionCurrency: options.subscriptionCurrency,
      queryCurrency,
    })
  );
  const [rawPlans, setRawPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const regionConfidence = useMemo<BillingRegionConfidence>(
    () => getBillingRegionConfidence({ phone: options.phone }),
    [options.phone]
  );

  useEffect(() => {
    setBillingCurrency(
      detectBillingCurrency({
        phone: options.phone,
        subscriptionCurrency: options.subscriptionCurrency,
        queryCurrency,
      })
    );
  }, [options.phone, options.subscriptionCurrency, queryCurrency]);

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

  const activeCurrency: BillingCurrency = (isLocked ? lockedCurrency : billingCurrency) ?? billingCurrency;

  const plans = useMemo(() => {
    const resolved = rawPlans
      .map((plan) => resolvePlanForCurrency(plan, activeCurrency))
      .filter((plan): plan is Plan => plan !== null);
    return sortPlans(resolved);
  }, [rawPlans, activeCurrency]);

  const setCurrency = (currency: BillingCurrency) => {
    if (isLocked) return;
    setBillingCurrency(currency);
    persistBillingCurrency(currency, true);
  };

  return {
    plans,
    billingCurrency: activeCurrency,
    setCurrency,
    loading,
    isLocked,
    regionConfidence,
    showCurrencyToggle: !isLocked,
  };
}
