"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserInfo, UserActivity, AdminSubscription, apiService } from '../../../lib/apiService';
import { Loader2, Trash2, ShieldOff, ShieldCheck, Plus, Minus, BadgeInfo, Lock, ReceiptText, ExternalLink } from 'lucide-react';
import { useAdminFeedback } from '../../../components/AdminFeedback';

interface UserDetailsModalProps {
  user: UserInfo;
  onClose: () => void;
  onRefresh: () => void;
}

export default function UserDetailsModal({ user, onClose, onRefresh }: UserDetailsModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'credits' | 'actions'>('details');
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [userCredits, setUserCredits] = useState<number>(user.credits);
  const [subscription, setSubscription] = useState<AdminSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [creditDelta, setCreditDelta] = useState<string>('10');
  const { toast, confirm } = useAdminFeedback();

  const isActive = user.isActive !== false;
  const userKey = user.email || user.userId || user.id;

  useEffect(() => {
    if (activeTab === 'activity') {
      loadUserActivity();
    } else if (activeTab === 'credits') {
      loadUserCredits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    void loadSubscriptionSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserActivity(user.id);
      setActivity(response.activities);
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Failed to load activity',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserCredits = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserCredits(user.id);
      setUserCredits(response.credits);
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Failed to load credits',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionSummary = async () => {
    if (!userKey) {
      setSubscription(null);
      return;
    }

    try {
      setSubscriptionLoading(true);
      const response = await apiService.getSubscriptions({
        email: user.email || undefined,
        userId: user.userId || undefined,
        search: user.userId || user.email || undefined,
        limit: 10,
        skip: 0,
      });

      const preferred = pickPrimarySubscription(response.subscriptions, userKey);
      setSubscription(preferred);
    } catch (error) {
      setSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const refreshAndClose = () => {
    onRefresh();
    onClose();
  };

  const handleDeleteUser = async () => {
    const confirmed = await confirm({
      title: 'Delete user account',
      message: `Delete ${user.userId || user.email}? This removes the user record, credits, and activity history.`,
      confirmLabel: 'Delete user',
    });

    if (!confirmed) return;

    try {
      setBusyAction('delete');
      await apiService.deleteUser(user.userId);
      toast({
        tone: 'success',
        title: 'User deleted',
        message: `${user.userId || user.email} was removed successfully.`,
      });
      refreshAndClose();
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Delete failed',
        message: error instanceof Error ? error.message : 'Failed to delete user',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSuspendToggle = async () => {
    const confirmed = await confirm({
      title: isActive ? 'Suspend user' : 'Reactivate user',
      message: isActive
        ? `Suspend ${user.userId || user.email}? They will be blocked from authenticated routes.`
        : `Reactivate ${user.userId || user.email}? They will regain access immediately.`,
      confirmLabel: isActive ? 'Suspend' : 'Reactivate',
    });

    if (!confirmed) return;

    try {
      setBusyAction(isActive ? 'suspend' : 'reactivate');
      if (isActive) {
        await apiService.suspendUser(user.userId);
      } else {
        await apiService.reactivateUser(user.userId);
      }

      toast({
        tone: 'success',
        title: isActive ? 'User suspended' : 'User reactivated',
        message: `${user.userId || user.email} has been updated.`,
      });
      refreshAndClose();
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Action failed',
        message: error instanceof Error ? error.message : 'Failed to update user status',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreditAdjust = async (direction: 'add' | 'subtract') => {
    const amount = Number(creditDelta);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        tone: 'error',
        title: 'Invalid amount',
        message: 'Enter a positive credit amount.',
      });
      return;
    }

    try {
      setBusyAction(direction);
      if (direction === 'add') {
        const response = await apiService.addCredits(user.userId, amount);
        setUserCredits(response.credits);
      } else {
        const response = await apiService.deductCredits(user.userId, amount);
        setUserCredits(response.credits);
      }

      toast({
        tone: 'success',
        title: direction === 'add' ? 'Credits added' : 'Credits deducted',
        message: `${amount} credits updated for ${user.userId || user.email}.`,
      });
      onRefresh();
      setActiveTab('credits');
    } catch (error) {
      toast({
        tone: 'error',
        title: 'Credit update failed',
        message: error instanceof Error ? error.message : 'Failed to update credits',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") {
      return 'N/A';
    }
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const tabs = useMemo(() => ([
    { id: 'details', label: 'Details', icon: '👤' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'credits', label: 'Credits', icon: '💰' },
    { id: 'actions', label: 'Actions', icon: '⚙️' }
  ] as const), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-black/92">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-purple-300">User profile</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{user.userId || 'Unknown User'}</h2>
              <p className="mt-1 text-sm text-gray-300">{user.email}</p>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="border-b border-white/10 px-6">
          <nav className="flex flex-wrap gap-2 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <InfoCard label="User ID" value={user.userId || 'N/A'} />
                <InfoCard label="Email" value={user.email || 'N/A'} />
                <InfoCard label="Credits" value={user.credits?.toLocaleString() || '0'} />
                <InfoCard label="Status" value={isActive ? 'Active' : 'Suspended'} />
                <InfoCard label="Created At" value={formatDate(user.createdAt)} />
                <InfoCard label="Updated At" value={formatDate(user.updatedAt)} />
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                      <ReceiptText className="h-4 w-4 text-purple-300" />
                      Subscription
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Billing summary</p>
                  </div>
                  {subscription && (
                    <button
                      onClick={() => router.push(`/admin/subscriptions?subscriptionId=${encodeURIComponent(subscription.subscriptionId)}`)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      Open subscription
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-5">
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center rounded-[20px] border border-white/10 bg-black/20 py-10 text-gray-300">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading subscription details...
                    </div>
                  ) : subscription ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard label="Plan" value={subscription.planName || subscription.planId || 'N/A'} />
                      <InfoCard label="Plan ID" value={subscription.planId || 'N/A'} />
                      <InfoCard label="Subscription ID" value={subscription.subscriptionId || 'N/A'} />
                      <InfoCard label="Status" value={formatSubscriptionStatus(subscription.status)} />
                      <InfoCard
                        label="Current period"
                        value={`${formatDate(subscription.currentPeriodStart)} → ${formatDate(subscription.currentPeriodEnd)}`}
                      />
                      <InfoCard
                        label={subscription.cancelAtCycleEnd ? 'Cancel scheduled' : 'Cancel state'}
                        value={subscription.cancelAtCycleEnd ? 'Yes' : 'No'}
                      />
                      <InfoCard
                        label="Scheduled cancel"
                        value={formatDate(subscription.cancelScheduledAt)}
                      />
                      <InfoCard
                        label="Cancelled at"
                        value={formatDate(subscription.cancelledAt)}
                      />
                    </div>
                  ) : (
                    <EmptyPanel
                      title="No subscription found"
                      message="This user does not have a linked subscription record yet."
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-300">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading activity...
                </div>
              ) : activity.length === 0 ? (
                <EmptyPanel title="No activity found" message="This user hasn't performed any actions yet." />
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{item.action}</p>
                          <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                        </div>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-medium text-gray-400">Current balance</p>
                <p className="mt-3 text-4xl font-light tracking-tight text-white">{userCredits.toLocaleString()}</p>
                <p className="mt-2 text-sm text-gray-400">Latest balance from the backend.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Adjust amount</label>
                <input
                  type="number"
                  value={creditDelta}
                  onChange={(e) => setCreditDelta(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0 placeholder:text-gray-500 focus:border-purple-400/40"
                  min={1}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCreditAdjust('add')}
                    disabled={busyAction === 'add'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {busyAction === 'add' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                  </button>
                  <button
                    onClick={() => handleCreditAdjust('subtract')}
                    disabled={busyAction === 'subtract'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-400 disabled:opacity-60"
                  >
                    {busyAction === 'subtract' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                    Deduct
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-5">
              <ActionPanel
                title={isActive ? 'Suspend account' : 'Reactivate account'}
                description={isActive ? 'Block this user from authenticated access.' : 'Restore authenticated access for this user.'}
                buttonLabel={isActive ? 'Suspend user' : 'Reactivate user'}
                icon={isActive ? ShieldOff : ShieldCheck}
                onClick={handleSuspendToggle}
                tone={isActive ? 'danger' : 'success'}
                busy={busyAction === 'suspend' || busyAction === 'reactivate'}
              />

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-gray-300">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-white">Password reset</p>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400">
                      Password reset is still handled in the identity provider console for this deployment.
                    </p>
                  </div>
                </div>
              </div>

              <ActionPanel
                title="Delete account"
                description="Remove the user, credits, and activity history. This cannot be undone."
                buttonLabel="Delete user"
                icon={Trash2}
                onClick={handleDeleteUser}
                tone="danger"
                busy={busyAction === 'delete'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gray-400">{label}</p>
      <p className="mt-3 break-words text-base font-medium text-white">{value}</p>
    </div>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
      <BadgeInfo className="mx-auto h-10 w-10 text-gray-500" />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{message}</p>
    </div>
  );
}

function formatSubscriptionStatus(value?: string) {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ');
}

function pickPrimarySubscription(subscriptions: AdminSubscription[], userKey: string) {
  if (subscriptions.length === 0) return null;

  const normalizedUserKey = userKey.toLowerCase();
  const scored = subscriptions
    .filter((sub) => {
      const matchesUser =
        sub.userId?.toLowerCase() === normalizedUserKey ||
        sub.email?.toLowerCase() === normalizedUserKey ||
        sub.subscriptionId?.toLowerCase().includes(normalizedUserKey);
      return matchesUser;
    })
    .sort((a, b) => {
      const aScore = subscriptionScore(a);
      const bScore = subscriptionScore(b);
      if (aScore !== bScore) return bScore - aScore;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  if (scored.length > 0) return scored[0];

  return subscriptions
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0] || null;
}

function subscriptionScore(subscription: AdminSubscription) {
  const status = (subscription.status || '').toLowerCase();
  if (status === 'active') return 5;
  if (status === 'past_due') return 4;
  if (status === 'created') return 3;
  if (status === 'cancelled') return 2;
  if (status === 'expired') return 1;
  return 0;
}

function ActionPanel({
  title,
  description,
  buttonLabel,
  icon: Icon,
  onClick,
  tone,
  busy,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => Promise<void> | void;
  tone: 'danger' | 'success' | 'neutral';
  busy: boolean;
}) {
  const toneClasses = {
    danger: 'border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15',
    neutral: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
  }[tone];

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400">{description}</p>
        </div>
        <button
          onClick={() => void onClick()}
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${toneClasses}`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
