import { describe, expect, it } from 'vitest';
import { formatSubscriptionDate, resolveSubscriptionPresentation } from './subscriptionPresentation';

const periodEnd = '2026-08-01T00:00:00.000Z';
const changeDate = '2026-08-01T00:00:00.000Z';

const activePro = {
  status: 'active',
  planId: 'pro',
  planName: 'Pro',
  currentPeriodEnd: periodEnd,
  amount: 799900,
};

describe('subscription card presentation', () => {
  // S1 — active subscription only
  it('S1 shows active state without scheduled notices', () => {
    const view = resolveSubscriptionPresentation(activePro)!;
    expect(view.state).toBe('active');
    expect(view.showScheduledDowngrade).toBe(false);
    expect(view.showCancelScheduled).toBe(false);
    expect(view.showCancelButton).toBe(true);
    expect(view.showResumeButton).toBe(false);
  });

  // S2 — downgrade scheduled only
  it('S2 shows downgrade notice without cancellation notice', () => {
    const view = resolveSubscriptionPresentation({
      ...activePro,
      pendingPlanId: 'starter',
      pendingPlanName: 'Starter',
      planChangeDate: changeDate,
    })!;
    expect(view.state).toBe('downgrade_scheduled');
    expect(view.showScheduledDowngrade).toBe(true);
    expect(view.showCancelScheduled).toBe(false);
    expect(view.showClearDowngradeButton).toBe(true);
    expect(view.scheduledDowngradeMessage).toContain('STARTER');
  });

  // S3 — cancellation scheduled only
  it('S3 shows cancellation notice without downgrade notice', () => {
    const view = resolveSubscriptionPresentation({
      ...activePro,
      cancelAtCycleEnd: true,
      cancelScheduledAt: changeDate,
    })!;
    expect(view.state).toBe('cancel_scheduled');
    expect(view.showCancelScheduled).toBe(true);
    expect(view.showScheduledDowngrade).toBe(false);
    expect(view.showResumeButton).toBe(true);
  });

  // S4 — conflicting flags: cancel wins over pending downgrade
  it('S4 hides downgrade when cancellation is scheduled', () => {
    const view = resolveSubscriptionPresentation({
      ...activePro,
      cancelAtCycleEnd: true,
      cancelScheduledAt: changeDate,
      pendingPlanId: 'starter',
      pendingPlanName: 'Starter',
      planChangeDate: changeDate,
    })!;
    expect(view.state).toBe('cancel_scheduled');
    expect(view.showScheduledDowngrade).toBe(false);
    expect(view.showCancelScheduled).toBe(true);
  });

  // S5 — stale cancelScheduledAt alone does not show cancellation UI
  it('S5 ignores orphan cancelScheduledAt without cancelAtCycleEnd', () => {
    const view = resolveSubscriptionPresentation({
      ...activePro,
      cancelScheduledAt: changeDate,
    })!;
    expect(view.state).toBe('active');
    expect(view.showCancelScheduled).toBe(false);
    expect(view.showResumeButton).toBe(false);
  });

  // S6 — consistent long: en-IN long format
  it('S6 formats dates consistently', () => {
    const formatted = formatSubscriptionDate(periodEnd);
    expect(formatted).toMatch(/1 August 2026|August 1, 2026/);
  });
});
