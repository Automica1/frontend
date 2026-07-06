// app/(main)/components/subscription/SubscriptionCard.tsx
'use client';
import React, { useState } from 'react';
import { subscriptionApi } from '../../lib/subscriptionApi';
import { BillingCurrency, formatPlanPrice, normalizeBillingCurrency } from '../../lib/billingCurrency';
import { resolveSubscriptionPresentation } from '../../lib/subscriptionPresentation';

interface Subscription {
    status: string;
    currentPeriodEnd: string;
    amount: number;
    currency?: string;
    planId: string;
    planName?: string;
    pendingPlanName?: string;
    subscriptionId?: string;
    cancelAtCycleEnd?: boolean;
    cancelScheduledAt?: string;
    cancelledAt?: string;
    pendingPlanId?: string;
    planChangeDate?: any;
}

interface Props {
    subscription: Subscription | null;
    onCancelled?: () => void;
}

const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
    past_due: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    expired: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    scheduled: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
};

export default function SubscriptionCard({ subscription, onCancelled }: Props) {
    const [cancelling, setCancelling] = useState(false);
    const [resuming, setResuming] = useState(false);
    const [clearingChange, setClearingChange] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');

    const handleCancel = async () => {
        setCancelling(true);
        setError('');
        try {
            await subscriptionApi.cancelSubscription();
            setShowConfirm(false);
            onCancelled?.();
        } catch (err: any) {
            setError(err?.message || 'Failed to cancel subscription. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const handleResume = async () => {
        setResuming(true);
        setError('');
        try {
            await subscriptionApi.resumeSubscription();
            onCancelled?.();
        } catch (err: any) {
            setError(err?.message || 'Failed to resume subscription. Please try again.');
        } finally {
            setResuming(false);
        }
    };

    const handleClearDowngrade = async () => {
        setClearingChange(true);
        setError('');
        try {
            await subscriptionApi.clearPendingPlanChange();
            onCancelled?.();
        } catch (err: any) {
            setError(err?.message || 'Failed to cancel scheduled change. Please try again.');
        } finally {
            setClearingChange(false);
        }
    };

    if (!subscription) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center flex items-center justify-center">
                <p className="text-gray-400">You don&apos;t have an active subscription.</p>
            </div>
        );
    }

    const presentation = resolveSubscriptionPresentation(subscription);

    if (presentation?.state === 'activating') {
        return (
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 text-center flex items-center justify-center">
                <p className="text-emerald-100/90">Payment received. Your subscription is activating.</p>
            </div>
        );
    }

    if (!presentation) {
        return null;
    }

    const billingCurrency = (normalizeBillingCurrency(subscription.currency) || 'USD') as BillingCurrency;
    const formattedPrice = formatPlanPrice(subscription.amount, billingCurrency);

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-2xl p-8 shadow-2xl group hover:border-purple-500/30 transition-all duration-500"
            style={{
                background: `
                    radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
                    linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)
                `,
            }}
        >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-2">Current Plan</p>
                        <h3 className="text-2xl font-light text-white uppercase tracking-tighter leading-none">
                            {subscription.planName || subscription.planId.replace(/-/g, ' ')}
                        </h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${statusColors[presentation.statusBadgeKey] || statusColors.expired}`}>
                        {presentation.statusBadgeLabel}
                    </span>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-light">{presentation.dateLabel}</span>
                        <span className="text-white font-light tracking-tight">{presentation.formattedPeriodEnd}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                        <span className="text-gray-400 font-light">Price</span>
                        <span className="text-white font-semibold">
                            {formattedPrice}
                            <span className="text-gray-500 font-light ml-1">/ month</span>
                        </span>
                    </div>
                    {presentation.showScheduledDowngrade && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                            <div>
                                <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Scheduled Change</p>
                                <p className="text-sm text-gray-300">{presentation.scheduledDowngradeMessage}</p>
                            </div>
                            {presentation.showClearDowngradeButton && (
                                <button
                                    onClick={handleClearDowngrade}
                                    disabled={clearingChange}
                                    className="w-full py-2 text-xs text-blue-200 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all disabled:opacity-50"
                                >
                                    {clearingChange ? 'Cancelling change...' : 'Cancel scheduled change'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-red-400 text-xs mb-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">{error}</p>
                )}

                {presentation.showCancelButton && !showConfirm && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full py-2 text-sm text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all duration-200"
                    >
                        Cancel Subscription
                    </button>
                )}

                {showConfirm && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-sm text-gray-300 mb-1 font-medium">Cancel your subscription?</p>
                        <p className="text-xs text-gray-500 mb-4">
                            This will cancel at the end of the current billing period on <span className="text-gray-300">{presentation.formattedPeriodEnd}</span>. Your remaining credits won&apos;t be affected.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowConfirm(false); setError(''); }}
                                disabled={cancelling}
                                className="flex-1 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:bg-white/5 transition-all"
                            >
                                Keep Subscription
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex-1 py-2 text-xs bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                )}

                {presentation.showCancelScheduled && (
                    <div className="space-y-3">
                        <p className="text-xs text-amber-300/80 text-center">
                            {presentation.cancelScheduledMessage}
                        </p>
                        <button
                            onClick={handleResume}
                            disabled={resuming}
                            className="w-full py-2 text-sm text-emerald-300 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-all duration-200 disabled:opacity-50"
                        >
                            {resuming ? 'Renewing...' : 'Renew Subscription'}
                        </button>
                    </div>
                )}

                {presentation.state === 'cancelled' && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Your subscription has been cancelled. Credits remain available until the end of the billing period.
                    </p>
                )}
            </div>
        </div>
    );
}
