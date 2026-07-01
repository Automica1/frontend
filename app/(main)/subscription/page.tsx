// app/(main)/subscription/page.tsx
'use client';

import React, { Suspense, useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { useCredits } from '../hooks/useCredits';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import PricingPlans from '../components/subscription/PricingPlans';
import PricingFAQ from '../components/pricing/PricingFAQ';
import { Spotlight } from "../components/ui/spotlight-new";
import Link from 'next/link';
import { Check, CreditCard, RefreshCw, Lock } from 'lucide-react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { buildLoginPath } from '../lib/authPaths';
import { clearPendingCheckout } from '../lib/pendingCheckoutStorage';

function PaymentStatusBanner() {
    const searchParams = useSearchParams();
    const status = searchParams?.get('payment');

    if (!status || status === 'success') {
        if (status === 'success') {
            return (
                <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-center text-emerald-100 text-sm">
                    Payment successful. Your subscription and credits are updating now.
                </div>
            );
        }
        return null;
    }

    if (status === 'cancelled') {
        return (
            <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center text-amber-100 text-sm">
                Checkout was cancelled. You can choose a plan again whenever you are ready.
            </div>
        );
    }

    return (
        <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center text-red-100 text-sm">
            Payment could not be completed. Please try again or contact support if the issue persists.
        </div>
    );
}

function SubscriptionPageContent() {
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: authLoading } = useKindeAuth();
    const { credits, subscription, loading, refreshCredits } = useCredits();
    const paymentHandledRef = useRef(false);
    const paymentStatus = searchParams?.get('payment');

    const handlePaymentSuccess = useCallback(() => {
        refreshCredits();
    }, [refreshCredits]);

    const handleCancelled = useCallback(() => {
        refreshCredits();
    }, [refreshCredits]);

    useEffect(() => {
        if (!paymentStatus) {
            return;
        }

        if (paymentStatus === 'success' || paymentStatus === 'cancelled' || paymentStatus === 'error') {
            clearPendingCheckout();
        }

        if (paymentStatus !== 'success' || paymentHandledRef.current) {
            return;
        }
        paymentHandledRef.current = true;

        let cancelled = false;
        const pollDelaysMs = [0, 1500, 3000, 6000, 12000];

        const poll = async () => {
            for (const delay of pollDelaysMs) {
                if (cancelled) return;
                if (delay > 0) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
                if (cancelled) return;
                await refreshCredits();
            }
        };

        void poll();

        return () => {
            cancelled = true;
        };
    }, [paymentStatus, refreshCredits]);

    useEffect(() => {
        if (paymentStatus !== 'success' || !subscription) {
            return;
        }

        const url = new URL(window.location.href);
        if (!url.searchParams.has('payment')) {
            return;
        }
        url.searchParams.delete('payment');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }, [paymentStatus, subscription]);

    const isActivating = paymentStatus === 'success' && !subscription;

    return (
        <>
        <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
        />
        <div className="min-h-screen pt-32 bg-[#0b0b0d] relative overflow-hidden p-4">
            {/* Background gradients from Hero */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black pointer-events-none z-0"></div>

            {/* Grid pattern from Hero */}
            <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}></div>

            <div className="fixed inset-0 h-screen w-full z-0 pointer-events-none antialiased">
                <Spotlight />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <Suspense fallback={null}>
                    <PaymentStatusBanner />
                </Suspense>
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                            Subscription Management
                        </span>
                        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-2"></div>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-light text-white mb-6 tracking-tighter leading-tight">
                        Your <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Subscription</span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-gray-300 font-light leading-relaxed opacity-90 mx-auto">
                        Manage your credits and subscription plan
                    </p>
                    {!authLoading && !isAuthenticated && (
                        <p className="mt-4 text-sm text-amber-200/90">
                            <Link href={buildLoginPath('/subscription')} className="underline hover:text-amber-100">
                                Sign in
                            </Link>
                            {' '}to subscribe or manage billing.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Current Balance Card */}
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
                            <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-3">Available Balance</p>
                            <div className="flex items-baseline">
                                <p className="text-5xl font-light text-white tracking-tighter">
                                    {typeof credits === 'number' ? credits.toLocaleString() : '...'}
                                </p>
                                <span className="text-gray-500 ml-2 font-light text-sm">credits</span>
                            </div>
                            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                                <button
                                    onClick={refreshCredits}
                                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
                                >
                                    <span className="text-base leading-none">↻</span> Refresh Balance
                                </button>
                                <Link href="/credits" className="text-xs text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center font-medium group/link">
                                    Redeem Coupon 
                                    <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status Card */}
                    {loading && !subscription ? (
                        <div className="h-40 bg-white/5 animate-pulse rounded-2xl" />
                    ) : isActivating ? (
                        <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 text-center flex items-center justify-center">
                            <p className="text-emerald-100/90">Activating your subscription. This usually takes a few seconds.</p>
                        </div>
                    ) : (
                        <SubscriptionCard subscription={subscription} onCancelled={handleCancelled} />
                    )}
                </div>

                {/* Pricing Section - Always show for management */}
                <div className="mt-12">
                    <div className="text-center mb-8">
                        <div className="inline-block mb-8">
                            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                                Subscriptions
                            </span>
                            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-light text-white tracking-tighter leading-tight">
                            {subscription?.status === 'active' ? 'Manage Your Plan' : 'Upgrade to Premium'}
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mt-4">
                            {subscription?.status === 'active'
                                ? 'Upgrade for more credits or downgrade for next cycle'
                                : 'Get 1,000 credits instantly upon subscription'}
                        </p>
                    </div>
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <p className="text-gray-400 font-light">Loading premium plans...</p>
                        </div>
                    }>
                        <PricingPlans onPaymentSuccess={handlePaymentSuccess} currentSubscription={subscription} />
                    </Suspense>
                </div>

                {/* How it works */}
                <div className="mt-32">
                    <div className="text-center mb-16">
                        <div className="inline-block mb-8">
                            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                                Subscription Logic
                            </span>
                            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-light text-white tracking-tighter leading-tight">
                            How Your <span className="text-purple-400">Subscription Works</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            {
                                icon: CreditCard,
                                title: "Monthly Billing",
                                description: "Billed on the same date each month. Credits are added instantly after each successful payment."
                            },
                            {
                                icon: RefreshCw,
                                title: "Credits Roll Over",
                                description: "Unused credits carry forward every month as long as your subscription is active. Nothing is wasted."
                            },
                            {
                                icon: Lock,
                                title: "Cancel Anytime",
                                description: "Cancel and keep full access until your billing period ends. No hidden fees, no hassle."
                            }
                        ].map((item, i) => (
                            <div 
                                key={i}
                                className="group relative overflow-hidden rounded-3xl border border-purple-500/20 transition-all duration-500 hover:scale-[1.02]"
                                style={{
                                    background: `
                                        radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
                                        radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
                                        linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)
                                    `,
                                }}
                            >
                                <div className="relative p-8 z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                            <item.icon className="w-6 h-6 text-purple-300" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-light mb-4 text-white tracking-tight leading-none">{item.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-light">{item.description}</p>
                                </div>
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-12 text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        <span className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-500" /> Automatic Retries</span>
                        <span className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-500" /> Rolling Expiration</span>
                        <span className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-500" /> Email Notifications</span>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-24">
                    <PricingFAQ />
                </div>
            </div>
        </div>
        </>
    );
}

function SubscriptionPageFallback() {
    return (
        <div className="min-h-screen pt-32 bg-[#0b0b0d] relative overflow-hidden p-4">
            <div className="relative z-10 max-w-7xl mx-auto text-center">
                <p className="text-gray-400 font-light">Loading subscription page...</p>
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<SubscriptionPageFallback />}>
            <SubscriptionPageContent />
        </Suspense>
    );
}
