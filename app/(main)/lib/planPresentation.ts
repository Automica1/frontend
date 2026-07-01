import { Plan } from './apiService';
import { Zap, Star, Crown } from 'lucide-react';
import React from 'react';

export function getPlanIcon(plan: Plan): React.ReactNode {
  const key = (plan.planId || plan.name || '').toLowerCase();
  if (key.includes('enterprise')) {
    return React.createElement(Crown, { className: 'w-6 h-6' });
  }
  if (key.includes('pro') || key.includes('professional')) {
    return React.createElement(Star, { className: 'w-6 h-6' });
  }
  return React.createElement(Zap, { className: 'w-6 h-6' });
}

export function isContactSalesPlan(plan: Plan): boolean {
  return Boolean(plan.contactSales);
}

export function isPopularPlan(plan: Plan): boolean {
  return Boolean(plan.isPopular);
}

export function getPlanFeatures(plan: Plan): string[] {
  if (plan.features?.length) {
    return plan.features.map((line) =>
      line.replace(/\{credits\}/gi, plan.credits.toLocaleString())
    );
  }

  return [
    `${plan.credits.toLocaleString()} AI credits included`,
    'Use with any API',
    'Email support (24 hr response)',
    'Secure key management & audit logs',
  ];
}

export function getMarketingCtaLabel(plan: Plan): string {
  if (plan.ctaLabel?.trim()) return plan.ctaLabel.trim();
  return isContactSalesPlan(plan) ? 'Contact Support' : 'Get Started';
}

export function getCheckoutCtaLabel(
  plan: Plan,
  options: {
    isCurrent?: boolean;
    isUpgrade?: boolean;
    isDowngrade?: boolean;
  } = {}
): string {
  if (options.isCurrent) return 'Current Plan';
  if (options.isUpgrade) return 'Upgrade Plan';
  if (options.isDowngrade) return 'Downgrade Plan';
  if (plan.ctaLabel?.trim() && !isContactSalesPlan(plan)) return plan.ctaLabel.trim();
  return 'Choose Plan';
}

export type PlanCardState = {
  isCurrent: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
};

export function resolvePlanCardState(
  plan: { planId: string; price: number },
  currentSubscription?: {
    status: string;
    planId: string;
    amount: number;
    currency?: string;
  } | null,
  billingCurrency?: string
): PlanCardState {
  const isCurrent = Boolean(
    currentSubscription?.status === 'active' && currentSubscription.planId === plan.planId
  );
  const sameCurrency =
    !currentSubscription?.currency || currentSubscription.currency === billingCurrency;
  const isUpgrade = Boolean(
    currentSubscription?.status === 'active' &&
      sameCurrency &&
      plan.price > (currentSubscription?.amount ?? 0)
  );
  const isDowngrade = Boolean(
    currentSubscription?.status === 'active' &&
      sameCurrency &&
      plan.price < (currentSubscription?.amount ?? 0)
  );
  return { isCurrent, isUpgrade, isDowngrade };
}

export function sortPlans(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => {
    const orderA = a.displayOrder ?? 0;
    const orderB = b.displayOrder ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.price - b.price;
  });
}
