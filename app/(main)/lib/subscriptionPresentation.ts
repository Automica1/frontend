export type SubscriptionSnapshot = {
  status: string;
  planId?: string;
  planName?: string;
  pendingPlanId?: string;
  pendingPlanName?: string;
  cancelAtCycleEnd?: boolean;
  cancelScheduledAt?: string;
  currentPeriodEnd?: string;
  planChangeDate?: string;
};

export type SubscriptionPresentationState =
  | 'activating'
  | 'active'
  | 'downgrade_scheduled'
  | 'cancel_scheduled'
  | 'past_due'
  | 'cancelled';

export type SubscriptionPresentation = {
  state: SubscriptionPresentationState;
  statusBadgeKey: string;
  statusBadgeLabel: string;
  dateLabel: 'Next Billing Date' | 'Access Until';
  formattedPeriodEnd: string;
  formattedChangeDate: string;
  showScheduledDowngrade: boolean;
  showCancelScheduled: boolean;
  showCancelButton: boolean;
  showResumeButton: boolean;
  showClearDowngradeButton: boolean;
  scheduledDowngradeMessage?: string;
  cancelScheduledMessage?: string;
};

export function formatSubscriptionDate(value?: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPlanLabel(planName?: string, planId?: string): string {
  return (planName || planId?.replace(/-/g, ' ') || 'the new plan').toUpperCase();
}

export function resolveSubscriptionPresentation(
  sub: SubscriptionSnapshot | null | undefined
): SubscriptionPresentation | null {
  if (!sub) return null;

  const formattedPeriodEnd = formatSubscriptionDate(sub.currentPeriodEnd);
  const formattedChangeDate = formatSubscriptionDate(sub.planChangeDate);

  if (sub.status === 'created') {
    return {
      state: 'activating',
      statusBadgeKey: 'active',
      statusBadgeLabel: 'activating',
      dateLabel: 'Next Billing Date',
      formattedPeriodEnd,
      formattedChangeDate,
      showScheduledDowngrade: false,
      showCancelScheduled: false,
      showCancelButton: false,
      showResumeButton: false,
      showClearDowngradeButton: false,
    };
  }

  const isActive = sub.status === 'active';
  const isCancelled = sub.status === 'cancelled';
  const isPastDue = sub.status === 'past_due';
  const isCancelScheduled = isActive && Boolean(sub.cancelAtCycleEnd);
  const hasPendingDowngrade = isActive && Boolean(sub.pendingPlanId) && !isCancelScheduled;

  if (isCancelScheduled) {
    return {
      state: 'cancel_scheduled',
      statusBadgeKey: 'scheduled',
      statusBadgeLabel: 'cancellation scheduled',
      dateLabel: 'Access Until',
      formattedPeriodEnd,
      formattedChangeDate,
      showScheduledDowngrade: false,
      showCancelScheduled: true,
      showCancelButton: false,
      showResumeButton: true,
      showClearDowngradeButton: false,
      cancelScheduledMessage: `Cancellation is scheduled. You keep access until ${formattedPeriodEnd}, then billing stops. Renew below, or choose a different plan to upgrade or downgrade — that also keeps your subscription active.`,
    };
  }

  if (hasPendingDowngrade) {
    const targetLabel = formatPlanLabel(sub.pendingPlanName, sub.pendingPlanId);
    return {
      state: 'downgrade_scheduled',
      statusBadgeKey: 'scheduled',
      statusBadgeLabel: 'change scheduled',
      dateLabel: 'Next Billing Date',
      formattedPeriodEnd,
      formattedChangeDate,
      showScheduledDowngrade: true,
      showCancelScheduled: false,
      showCancelButton: true,
      showResumeButton: false,
      showClearDowngradeButton: true,
      scheduledDowngradeMessage: `Switching to ${targetLabel} on ${formattedChangeDate}. You'll stay on your current plan until then.`,
    };
  }

  if (isPastDue) {
    return {
      state: 'past_due',
      statusBadgeKey: 'past_due',
      statusBadgeLabel: 'past due',
      dateLabel: 'Next Billing Date',
      formattedPeriodEnd,
      formattedChangeDate,
      showScheduledDowngrade: false,
      showCancelScheduled: false,
      showCancelButton: true,
      showResumeButton: false,
      showClearDowngradeButton: false,
    };
  }

  if (isCancelled) {
    return {
      state: 'cancelled',
      statusBadgeKey: 'cancelled',
      statusBadgeLabel: 'cancelled',
      dateLabel: 'Access Until',
      formattedPeriodEnd,
      formattedChangeDate,
      showScheduledDowngrade: false,
      showCancelScheduled: false,
      showCancelButton: false,
      showResumeButton: false,
      showClearDowngradeButton: false,
    };
  }

  return {
    state: 'active',
    statusBadgeKey: 'active',
    statusBadgeLabel: 'active',
    dateLabel: 'Next Billing Date',
    formattedPeriodEnd,
    formattedChangeDate,
    showScheduledDowngrade: false,
    showCancelScheduled: false,
    showCancelButton: isActive,
    showResumeButton: false,
    showClearDowngradeButton: false,
  };
}
