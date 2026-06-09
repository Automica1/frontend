import React, { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { apiService, Plan } from '../../lib/apiService';
import { Loader2, Zap, Star, Crown } from 'lucide-react';
import { PricingCardUI } from '../pricing/PricingCardUI';

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

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiService.getActivePlans();
                setPlans(data);
            } catch (err) {
                console.error('Failed to fetch plans', err);
            } finally {
                setFetchingPlans(false);
            }
        };
        fetchPlans();
    }, []);

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
        if (!RAZORPAY_KEY_ID) {
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
            const isUpgrade = currentSubscription && currentSubscription.status === 'active' && plan.price > currentSubscription.amount;
            let order;
            if (isUpgrade) {
                order = await apiService.createUpgradeOrder(plan.planId);
            } else {
                order = await apiService.createOrder(plan.planId);
            }

            const orderData = order as any;
            const isSubscription = !isUpgrade && !!orderData.subscriptionId;

            const options: Record<string, any> = {
                key: RAZORPAY_KEY_ID,
                name: 'Automica',
                description: `${isUpgrade ? 'Upgrade to' : ''} ${plan.name} — ${plan.credits.toLocaleString()} Credits/mo`,
                theme: { color: '#8b5cf6' },
                // Prefill with authenticated user's details when available to avoid Razorpay asking for them
                prefill: {
                    // Kinde user type is narrow in our typings — cast to any to safely access optional fields
                    name: isAuthenticated ? (((user as any)?.given_name) || ((user as any)?.name) || '') : '',
                    email: isAuthenticated ? (((user as any)?.email) || '') : '',
                    contact: isAuthenticated ? (((user as any)?.phone) || ((user as any)?.phone_number) || '') : '',
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
        <div className={`grid grid-cols-1 ${sortedPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3 max-w-6xl'} gap-8 lg:gap-12 mx-auto px-4 mt-20`}>
            {sortedPlans.map((plan, index) => {
                const isCurrent = currentSubscription && currentSubscription.status === 'active' && currentSubscription.planId === plan.planId;
                const isUpgrade = currentSubscription && currentSubscription.status === 'active' && plan.price > currentSubscription.amount;
                const isDowngrade = currentSubscription && currentSubscription.status === 'active' && plan.price < currentSubscription.amount;

                let buttonText = 'Choose Plan';
                if (isCurrent) buttonText = 'Current Plan';
                else if (isUpgrade) buttonText = 'Upgrade Plan';
                else if (isDowngrade) buttonText = 'Downgrade Plan';

                const isPopular = plan.name.toLowerCase() === 'professional' || plan.name.toLowerCase() === 'pro plan' || plan.name.toLowerCase() === 'pro';

                return (
                    <PricingCardUI
                        key={plan.id}
                        name={plan.name}
                        price={`$${plan.price / 100}`}
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
    );
}
