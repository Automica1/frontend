// app/(main)/subscription/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../lib/subscriptionApi';
import { useCredits } from '../hooks/useCredits';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import PricingPlans from '../components/subscription/PricingPlans';

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { credits, refreshCredits } = useCredits();

    const loadStatus = async () => {
        try {
            setLoading(true);
            const data = await subscriptionApi.getStatus();
            setSubscription(data);
        } catch (err) {
            console.error('Failed to fetch subscription status', err);
            setSubscription(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
        // Always refresh credits when visiting this page
        refreshCredits();
    }, []);

    const handlePaymentSuccess = () => {
        loadStatus();
        refreshCredits();
    };

    const handleCancelled = () => {
        loadStatus();
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

                {/* Pricing Section - Only show if not active */}
                {(!subscription || subscription.status !== 'active') && (
                    <div className="mt-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-light text-white">Upgrade to Premium</h2>
                            <p className="text-gray-400 mt-2">Get 1,000 credits instantly upon subscription</p>
                        </div>
                        <PricingPlans onPaymentSuccess={handlePaymentSuccess} />
                    </div>
                )}
            </div>
        </div>
    );
}
