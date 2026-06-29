import React, { useState, useEffect, useMemo } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { apiService, Plan } from '../../lib/apiService';
import { Loader2, Zap, Star, Crown } from 'lucide-react';
import { PricingCardUI } from '../pricing/PricingCardUI';
import {
    BillingCurrency,
    SUPPORTED_CURRENCIES,
    currencyLabel,
    detectBillingCurrency,
    formatPlanPrice,
    persistBillingCurrency,
} from '../../lib/billingCurrency';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

const getPlanIcon = (name: string) => {
    switch (name.toLowerCase()) {
        case 'starter': return <Zap className="w-6 h-6" />;
        case 'professional': return <Star className="w-6 h-6" />;
        case 'enterprise': return <Crown className="w-6 h-6" />;
        default: return <Zap className="w-6 h-6" />;
    }
};

export default function PricingPlans({ onPaymentSuccess, currentSubscription }: {
    onPaymentSuccess: () => void,
    currentSubscription?: any
}) {
    const { isAuthenticated, user } = useKindeAuth();
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [fetchingPlans, setFetchingPlans] = useState(true);
    const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(RAZORPAY_KEY_ID || null);

    const userPhone = isAuthenticated
        ? (((user as any)?.phone) || ((user as any)?.phone_number) || '')
        : '';

    const lockedCurrency = currentSubscription?.currency as BillingCurrency | undefined;
    const [billingCurrency, setBillingCurrency] = useState<BillingCurrency>(() =>
        detectBillingCurrency({
            phone: userPhone,
            subscriptionCurrency: currentSubscription?.currency,
        })
    );

    useEffect(() => {
        setBillingCurrency(detectBillingCurrency({
            phone: userPhone,
            subscriptionCurrency: currentSubscription?.currency,
        }));
    }, [userPhone, currentSubscription?.currency]);

    useEffect(() => {
        const fetchPlans = async () => {
            setFetchingPlans(true);
            try {
                const data = await apiService.getActivePlans(billingCurrency);
                setPlans(data);
            } catch (err) {
                console.error('Failed to fetch plans', err);
            } finally {
                setFetchingPlans(false);
            }
        };
        void fetchPlans();
    }, [billingCurrency]);

    useEffect(() => {
        if (razorpayKeyId) {
            return;
        }

        const fetchBillingConfig = async () => {
            try {
                const config = await apiService.getPublicBillingConfig();
                if (config.razorpayKeyId) {
                    setRazorpayKeyId(config.razorpayKeyId);
                }
            } catch (err) {
                console.error('Failed to load billing config', err);
            }
        };

        void fetchBillingConfig();
    }, [razorpayKeyId]);

    const handleCurrencyChange = (currency: BillingCurrency) => {
        if (lockedCurrency) return;
        setBillingCurrency(currency);
        persistBillingCurrency(currency);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }

            const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (plan: Plan) => {
        const keyId = razorpayKeyId;
        if (!keyId) {
            alert('Payment configuration is missing. Please contact support.');
            return;
        }

        setLoadingPlanId(plan.planId);
        document.querySelectorAll('.razorpay-container').forEach((node) => node.remove());
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoadingPlanId(null);
            return;
        }

        try {
            const checkoutCurrency = (lockedCurrency || billingCurrency) as BillingCurrency;
            const isUpgrade = currentSubscription
                && currentSubscription.status === 'active'
                && currentSubscription.currency === checkoutCurrency
                && plan.price > currentSubscription.amount;

            let order;
            if (isUpgrade) {
                order = await apiService.createUpgradeOrder(plan.planId);
            } else {
                order = await apiService.createOrder(plan.planId, checkoutCurrency);
            }

            const orderData = order as any;
            const isSubscription = !isUpgrade && !!orderData.subscriptionId;

            const options: Record<string, any> = {
                key: keyId,
                name: 'Automica',
                description: `${isUpgrade ? 'Upgrade to' : ''} ${plan.name} — ${plan.credits.toLocaleString()} Credits/mo`,
                theme: { color: '#8b5cf6' },
                prefill: {
                    name: isAuthenticated ? (((user as any)?.given_name) || ((user as any)?.name) || '') : '',
                    email: isAuthenticated ? (((user as any)?.email) || '') : '',
                    contact: userPhone,
                },
                modal: {
                    ondismiss: function () {
                        setLoadingPlanId(null);
                    },
                },
                handler: async function (response: any) {
                    try {
                        if (isSubscription) {
                            await apiService.verifyPayment({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                        } else {
                            await apiService.verifyPayment({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                        }
                        onPaymentSuccess();
                    } catch (err) {
                        console.error('Payment verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    } finally {
                        setLoadingPlanId(null);
                    }
                },
            };

            if (isSubscription) {
                options.subscription_id = orderData.subscriptionId;
            } else {
                options.order_id = orderData.orderId;
                options.amount = order.amount;
                options.currency = order.currency;
            }

            const paymentObject = new (window as any).Razorpay(options);
            setLoadingPlanId(null);
            paymentObject.open();
        } catch (err) {
            console.error('Failed to process subscription', err);
            alert('Failed to initiate payment. Please try again.');
            setLoadingPlanId(null);
        }
    };

    const handleDowngrade = async (plan: Plan) => {
        if (!confirm(`Are you sure you want to downgrade to ${plan.name}? The change will take effect at the end of your current billing cycle.`)) {
            return;
        }

        setLoadingPlanId(plan.planId);
        try {
            await apiService.downgradeSubscription(plan.planId);
            alert(`Your downgrade to ${plan.name} has been scheduled.`);
            onPaymentSuccess();
        } catch (err) {
            console.error('Failed to downgrade', err);
            alert('Failed to schedule downgrade. Please try again.');
        } finally {
            setLoadingPlanId(null);
        }
    };

    const currencyToggle = useMemo(() => (
        <div className="flex flex-col items-center gap-3 mt-8">
            <p className="text-xs uppercase tracking-widest text-gray-500">Billing currency</p>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                {SUPPORTED_CURRENCIES.map((currency) => (
                    <button
                        key={currency}
                        type="button"
                        disabled={!!lockedCurrency && lockedCurrency !== currency}
                        onClick={() => handleCurrencyChange(currency)}
                        className={`px-4 py-2 text-sm rounded-full transition-colors ${
                            billingCurrency === currency
                                ? 'bg-purple-500/20 text-purple-200'
                                : 'text-gray-400 hover:text-white'
                        } ${lockedCurrency && lockedCurrency !== currency ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        {currencyLabel(currency)}
                    </button>
                ))}
            </div>
            {lockedCurrency && (
                <p className="text-xs text-gray-500">Currency locked to your active subscription ({lockedCurrency}).</p>
            )}
        </div>
    ), [billingCurrency, lockedCurrency]);

    if (fetchingPlans) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-gray-400 font-light">Loading premium plans...</p>
            </div>
        );
    }

    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <>
            {currencyToggle}
            <div className={`grid grid-cols-1 ${sortedPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3 max-w-6xl'} gap-8 lg:gap-12 mx-auto px-4 mt-12`}>
                {sortedPlans.map((plan, index) => {
                    const isCurrent = currentSubscription && currentSubscription.status === 'active' && currentSubscription.planId === plan.planId;
                    const sameCurrency = !currentSubscription?.currency || currentSubscription.currency === billingCurrency;
                    const isUpgrade = currentSubscription && currentSubscription.status === 'active' && sameCurrency && plan.price > currentSubscription.amount;
                    const isDowngrade = currentSubscription && currentSubscription.status === 'active' && sameCurrency && plan.price < currentSubscription.amount;

                    let buttonText = 'Choose Plan';
                    if (isCurrent) buttonText = 'Current Plan';
                    else if (isUpgrade) buttonText = 'Upgrade Plan';
                    else if (isDowngrade) buttonText = 'Downgrade Plan';

                    const isPopular = plan.name.toLowerCase() === 'professional' || plan.name.toLowerCase() === 'pro plan' || plan.name.toLowerCase() === 'pro';

                    return (
                        <PricingCardUI
                            key={plan.id}
                            name={plan.name}
                            price={formatPlanPrice(plan.price, billingCurrency)}
                            description={plan.description || "The perfect plan to accelerate your business with Automica AI"}
                            popular={isPopular}
                            index={index}
                            icon={getPlanIcon(plan.name)}
                            features={[
                                `${plan.credits.toLocaleString()} usage credits every month`,
                                'Credits roll over indefinitely',
                                'Advanced AI features unlocked',
                                'Priority support',
                                'Secure access & audit logs'
                            ]}
                            buttonText={buttonText}
                            isLoading={loadingPlanId === plan.planId}
                            disabled={isCurrent || !!loadingPlanId}
                            onButtonClick={() => {
                                if (isCurrent) return;
                                if (isDowngrade) {
                                    handleDowngrade(plan);
                                } else {
                                    handleSubscribe(plan);
                                }
                            }}
                        />
                    );
                })}
            </div>
        </>
    );
}
