// app/(main)/subscription/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../lib/subscriptionApi';
import { useCredits } from '../hooks/useCredits';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import PricingPlans from '../components/subscription/PricingPlans';

export default function SubscriptionPage() {
    const { credits, subscription, loading, refreshCredits } = useCredits();

    useEffect(() => {
        // Always refresh credits and subscription when visiting this page
        refreshCredits();
    }, [refreshCredits]);

    const handlePaymentSuccess = () => {
        refreshCredits();
    };

    const handleCancelled = () => {
        refreshCredits();
    };

    return (
        <div className="min-h-screen pt-32 bg-[#0b0b0d] relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                            Subscription Management
                        </span>
                        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-2"></div>
                    </div>
                    <h1 className="text-4xl font-light text-white mb-4 tracking-tight">Your <span className="text-purple-400">Subscription</span></h1>
                    <p className="text-gray-400 font-light text-lg">Manage your credits and subscription plan</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Current Balance Card */}
                    <div className="relative overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
                        <div className="flex items-baseline">
                            <p className="text-4xl font-light text-white tracking-tight">
                                {typeof credits === 'number' ? credits.toLocaleString() : '...'}
                            </p>
                            <span className="text-gray-500 ml-2">credits</span>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={refreshCredits}
                                className="text-xs text-gray-600 hover:text-gray-400 transition-colors mr-4"
                            >
                                ↻ Refresh
                            </button>
                            <a href="/credits" className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center">
                                Redeem coupon token
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Subscription Status Card */}
                    {loading ? (
                        <div className="h-40 bg-white/5 animate-pulse rounded-2xl" />
                    ) : (
                        <SubscriptionCard subscription={subscription} onCancelled={handleCancelled} />
                    )}
                </div>

                {/* Pricing Section - Always show for management */}
                <div className="mt-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-light text-white">
                            {subscription?.status === 'active' ? 'Manage Your Plan' : 'Upgrade to Premium'}
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {subscription?.status === 'active'
                                ? 'Upgrade for more credits or downgrade for next cycle'
                                : 'Get 1,000 credits instantly upon subscription'}
                        </p>
                    </div>
                    <PricingPlans onPaymentSuccess={handlePaymentSuccess} currentSubscription={subscription} />
                </div>
            </div>
        </div>
    );
}
