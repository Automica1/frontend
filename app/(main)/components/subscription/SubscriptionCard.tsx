// app/(main)/components/subscription/SubscriptionCard.tsx
'use client';
import React, { useState } from 'react';
import { subscriptionApi } from '../../lib/subscriptionApi';

interface Subscription {
    status: string;
    currentPeriodEnd: string;
    amount: number;
    planId: string;
    subscriptionId?: string;
    pendingPlanId?: string;
    planChangeDate?: any;
}

interface Props {
    subscription: Subscription | null;
    onCancelled?: () => void;
}

export default function SubscriptionCard({ subscription, onCancelled }: Props) {
    const [cancelling, setCancelling] = useState(false);
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

    if (!subscription || subscription.status === 'created') {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center flex items-center justify-center">
                <p className="text-gray-400">You don&apos;t have an active subscription.</p>
            </div>
        );
    }

    const isActive = subscription.status === 'active';
    const isCancelled = subscription.status === 'cancelled';
    const expiryDate = subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const statusColors: Record<string, string> = {
        active: 'bg-green-500/10 text-green-400 border border-green-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
        past_due: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        expired: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    };

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
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-purple-400 text-sm font-medium uppercase tracking-widest mb-2">Current Plan</p>
                        <h3 className="text-2xl font-light text-white uppercase tracking-tighter leading-none">{subscription.planId.replace(/-/g, ' ')}</h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${statusColors[subscription.status] || statusColors.expired}`}>
                        {subscription.status}
                    </span>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-light">{isCancelled ? 'Access Until' : 'Next Billing Date'}</span>
                        <span className="text-white font-light tracking-tight">{expiryDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                        <span className="text-gray-400 font-light">Price</span>
                        <span className="text-white font-semibold">
                            ${(subscription.amount / 100).toFixed(2)} 
                            <span className="text-gray-500 font-light ml-1">/ month</span>
                        </span>
                    </div>
                    {subscription.pendingPlanId && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Scheduled Change</p>
                            <p className="text-sm text-gray-300">
                                Switching to <span className="text-white font-medium uppercase">{subscription.pendingPlanId.replace(/-/g, ' ')}</span> on {new Date(subscription.planChangeDate).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-red-400 text-xs mb-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">{error}</p>
                )}

                {/* Cancel button — only show for active subscriptions */}
                {isActive && !showConfirm && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full py-2 text-sm text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all duration-200"
                    >
                        Cancel Subscription
                    </button>
                )}

                {/* Confirmation dialog */}
                {showConfirm && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-sm text-gray-300 mb-1 font-medium">Cancel your subscription?</p>
                        <p className="text-xs text-gray-500 mb-4">
                            You&apos;ll keep access until <span className="text-gray-300">{expiryDate}</span>. Your remaining credits won&apos;t be affected.
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

                {isCancelled && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Your subscription has been cancelled. Credits remain available until the end of the billing period.
                    </p>
                )}
            </div>
        </div>
    );
}
