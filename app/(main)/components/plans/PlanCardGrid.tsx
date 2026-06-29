'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plan } from '../../lib/apiService';
import { BillingCurrency, formatPlanPrice } from '../../lib/billingCurrency';
import { PricingCardUI } from '../pricing/PricingCardUI';
import {
  getCheckoutCtaLabel,
  getMarketingCtaLabel,
  getPlanFeatures,
  getPlanIcon,
  isContactSalesPlan,
  isPopularPlan,
} from '../../lib/planPresentation';
import { buildLoginPath } from '../../lib/authPaths';
import { persistBillingCurrency } from '../../lib/billingCurrency';

export type PlanCardGridMode = 'marketing' | 'checkout';

type PlanCardGridProps = {
  mode: PlanCardGridMode;
  plans: Plan[];
  billingCurrency: BillingCurrency;
  highlightPlanId?: string | null;
  currentSubscription?: any;
  loadingPlanId?: string | null;
  onSubscribe?: (plan: Plan) => void;
  onDowngrade?: (plan: Plan) => void;
};

export function PlanCardGrid({
  mode,
  plans,
  billingCurrency,
  highlightPlanId,
  currentSubscription,
  loadingPlanId = null,
  onSubscribe,
  onDowngrade,
}: PlanCardGridProps) {
  const router = useRouter();
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!highlightPlanId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightPlanId, plans.length]);

  const handleMarketingClick = (plan: Plan) => {
    if (isContactSalesPlan(plan)) {
      router.push('/contact');
      return;
    }
    persistBillingCurrency(billingCurrency, true);
    router.push(
      buildLoginPath(`/subscription?currency=${billingCurrency}&plan=${encodeURIComponent(plan.planId)}`)
    );
  };

  return (
    <div
      className={`grid grid-cols-1 ${
        plans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3 max-w-6xl'
      } gap-8 lg:gap-12 mx-auto px-4 mt-12`}
    >
      {plans.map((plan, index) => {
        const isContactSales = isContactSalesPlan(plan);
        const isHighlighted = highlightPlanId === plan.planId;
        const isCurrent =
          currentSubscription &&
          currentSubscription.status === 'active' &&
          currentSubscription.planId === plan.planId;
        const sameCurrency =
          !currentSubscription?.currency || currentSubscription.currency === billingCurrency;
        const isUpgrade =
          currentSubscription &&
          currentSubscription.status === 'active' &&
          sameCurrency &&
          plan.price > currentSubscription.amount;
        const isDowngrade =
          currentSubscription &&
          currentSubscription.status === 'active' &&
          sameCurrency &&
          plan.price < currentSubscription.amount;

        const priceLabel = isContactSales
          ? 'Custom'
          : mode === 'marketing'
            ? `${formatPlanPrice(plan.price, billingCurrency)} / month`
            : formatPlanPrice(plan.price, billingCurrency);

        const buttonText =
          mode === 'marketing'
            ? getMarketingCtaLabel(plan)
            : getCheckoutCtaLabel(plan, { isCurrent, isUpgrade, isDowngrade });

        return (
          <div
            key={plan.planId}
            ref={isHighlighted ? highlightRef : undefined}
            className={isHighlighted ? 'rounded-3xl ring-2 ring-purple-400/60 ring-offset-2 ring-offset-black/40' : undefined}
          >
            <PricingCardUI
              name={plan.name}
              price={
                <motion.span
                  key={`${plan.planId}-${billingCurrency}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {priceLabel}
                </motion.span>
              }
              description={
                plan.description || 'The perfect plan to accelerate your business with Automica AI'
              }
              icon={getPlanIcon(plan)}
              features={getPlanFeatures(plan)}
              popular={isPopularPlan(plan)}
              index={index}
              buttonText={buttonText}
              isLoading={loadingPlanId === plan.planId}
              disabled={mode === 'checkout' && (isCurrent || !!loadingPlanId)}
              onButtonClick={() => {
                if (mode === 'marketing') {
                  handleMarketingClick(plan);
                  return;
                }
                if (isCurrent) return;
                if (isDowngrade) {
                  onDowngrade?.(plan);
                  return;
                }
                onSubscribe?.(plan);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
