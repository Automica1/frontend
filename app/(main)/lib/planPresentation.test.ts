import { describe, expect, it } from 'vitest';
import { getCheckoutCtaLabel, getMarketingCtaLabel, resolvePlanCardState } from './planPresentation';

const starter = { planId: 'starter', price: 99900 };
const pro = { planId: 'pro', price: 799900 };

const activeStarter = {
  status: 'active',
  planId: 'starter',
  amount: 99900,
  currency: 'INR',
};

describe('subscription plan UI cases', () => {
  // I1 — current plan card
  it('I1 shows Current Plan for active matching plan', () => {
    const state = resolvePlanCardState(starter, activeStarter, 'INR');
    expect(state.isCurrent).toBe(true);
    expect(getCheckoutCtaLabel(starter, state)).toBe('Current Plan');
  });

  // I2 — higher plan upgrade CTA
  it('I2 shows Upgrade Plan for higher tier', () => {
    const state = resolvePlanCardState(pro, activeStarter, 'INR');
    expect(state.isUpgrade).toBe(true);
    expect(getCheckoutCtaLabel(pro, state)).toBe('Upgrade Plan');
  });

  // I3 — lower plan downgrade CTA
  it('I3 shows Downgrade Plan for lower tier', () => {
    const state = resolvePlanCardState(starter, { ...activeStarter, planId: 'pro', amount: 799900 }, 'INR');
    expect(state.isDowngrade).toBe(true);
    expect(getCheckoutCtaLabel(starter, state)).toBe('Downgrade Plan');
  });

  // I4 — guest marketing CTA
  it('I4 shows Get Started for guests without subscription', () => {
    expect(getMarketingCtaLabel(starter)).toBe('Get Started');
  });

  // I5 — signed-in without sub chooses plan
  it('I5 shows Choose Plan for signed-in user without active sub', () => {
    const state = resolvePlanCardState(starter, null, 'INR');
    expect(getCheckoutCtaLabel(starter, state)).toBe('Choose Plan');
  });

  // I6 / B10 — cross-currency blocks upgrade/downgrade detection
  it('I6/B10 does not mark upgrade when billing currency mismatches subscription', () => {
    const state = resolvePlanCardState(pro, { ...activeStarter, currency: 'USD', amount: 1200 }, 'INR');
    expect(state.isUpgrade).toBe(false);
    expect(state.isDowngrade).toBe(false);
  });

  // I7 — pending downgrade target shows Scheduled
  it('I7 marks pending downgrade target plan as scheduled', () => {
    const state = resolvePlanCardState(starter, {
      ...activeStarter,
      planId: 'pro',
      amount: 799900,
      pendingPlanId: 'starter',
    }, 'INR');
    expect(state.isPendingTarget).toBe(true);
    expect(getCheckoutCtaLabel(starter, state)).toBe('Scheduled');
  });

  // I8 — cancel scheduled still allows upgrade/downgrade (implicit renew)
  it('I8 allows upgrade and downgrade while cancellation is scheduled', () => {
    const cancelPending = {
      status: 'active',
      planId: 'pro',
      amount: 799900,
      currency: 'INR',
      cancelAtCycleEnd: true,
    };
    const downgradeState = resolvePlanCardState(starter, cancelPending, 'INR');
    expect(downgradeState.isDowngrade).toBe(true);
    expect(downgradeState.cancelScheduled).toBe(true);
    expect(getCheckoutCtaLabel(starter, downgradeState)).toBe('Downgrade & renew');

    const upgradeState = resolvePlanCardState(pro, { ...activeStarter, cancelAtCycleEnd: true }, 'INR');
    expect(upgradeState.isUpgrade).toBe(true);
    expect(getCheckoutCtaLabel(pro, upgradeState)).toBe('Upgrade & renew');
  });
});
