// x:\Web Dev\Automica\frontend\app\(main)\components\subscription\PricingPlans.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { apiService, Plan } from '../../lib/apiService';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function PricingPlans({ onPaymentSuccess }: { onPaymentSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
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
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (plan: Plan) => {
        setLoading(true);
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            const order = await apiService.createOrder(plan.planId);

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Automica',
                description: `${plan.name} - ${plan.credits.toLocaleString()} Credits`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    try {
                        await apiService.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        onPaymentSuccess();
                    } catch (err) {
                        console.error('Payment verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: '',
                },
                theme: {
                    color: '#8b5cf6', // purple-500
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error('Failed to create order', err);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setLoading(false);
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {plans.map((plan, index) => (
                <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative overflow-hidden group bg-white/[0.03] border ${index === 1 ? 'border-purple-500/50 shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]' : 'border-white/10'
                        } backdrop-blur-xl rounded-3xl p-8 flex flex-col`}
                >
                    {index === 1 && (
                        <div className="absolute top-0 right-0 px-4 py-1 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Most Popular
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-2xl font-light text-white mb-2">{plan.name}</h3>
                        <p className="text-purple-400 text-xs font-medium uppercase tracking-widest">{plan.credits.toLocaleString()} Credits / mo</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline text-white">
                            <span className="text-4xl font-light">${plan.price / 100}</span>
                            <span className="text-gray-400 ml-2 font-light">/month</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">{plan.description}</p>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                        {[
                            `${plan.credits.toLocaleString()} usage credits every month`,
                            'Credits roll over indefinitely',
                            'Advanced AI features unlocked',
                            'Priority 24/7 support',
                            'No expiration on active sub'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start text-gray-400 text-sm font-light leading-snug">
                                <Check className="w-4 h-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-medium text-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${index === 1
                            ? 'bg-gradient-to-r from-purple-500 to-purple-800 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Choose Plan'}
                    </button>

                    <p className="mt-4 text-center text-[10px] text-gray-600 uppercase tracking-widest">
                        SECURE PAYMENT · RAZORPAY
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
