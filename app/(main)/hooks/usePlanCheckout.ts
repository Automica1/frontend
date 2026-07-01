'use client';

import { useCallback, useEffect, useState } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService, Plan } from '../lib/apiService';
import { BillingCurrency } from '../lib/billingCurrency';
import { buildLoginPath } from '../lib/authPaths';

const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(Boolean((window as any).Razorpay)), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(Boolean((window as any).Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function usePlanCheckout(options: {
  billingCurrency: BillingCurrency;
  currentSubscription?: any;
  onPaymentSuccess: () => void;
  userPhone?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading: authLoading } = useKindeAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const requireAuthRedirect = useCallback(
    (plan?: Plan) => {
      const currency = searchParams?.get('currency') || options.billingCurrency;
      const planParam = plan?.planId ? `&plan=${encodeURIComponent(plan.planId)}` : '';
      const redirectPath = `/subscription?currency=${currency}${planParam}`;
      router.push(buildLoginPath(redirectPath));
    },
    [options.billingCurrency, router, searchParams]
  );

  const handleSubscribe = useCallback(
    async (plan: Plan) => {
      if (!authLoading && !isAuthenticated) {
        requireAuthRedirect(plan);
        return;
      }

      if (!razorpayKeyId) {
        alert('Payment configuration is missing. Please contact support.');
        return;
      }

      setLoadingPlanId(plan.planId);

      const sdkReady = await loadRazorpay();

      if (!sdkReady) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoadingPlanId(null);
        return;
      }

      try {
        const checkoutCurrency = options.billingCurrency;
        const currentSubscription = options.currentSubscription;
        const isUpgrade =
          currentSubscription &&
          currentSubscription.status === 'active' &&
          currentSubscription.currency === checkoutCurrency &&
          plan.price > currentSubscription.amount;

        const order = isUpgrade
          ? await apiService.createUpgradeOrder(plan.planId)
          : await apiService.createOrder(plan.planId, checkoutCurrency);

        const orderData = order as any;
        const isSubscription = !isUpgrade && !!orderData.subscriptionId;

        const paymentOptions: Record<string, any> = {
          key: razorpayKeyId,
          name: 'Automica',
          description: `${isUpgrade ? 'Upgrade to' : ''} ${plan.name} — ${plan.credits.toLocaleString()} Credits/mo`,
          theme: { color: '#8b5cf6' },
          prefill: {
            name: isAuthenticated ? ((user as any)?.given_name || (user as any)?.name || '') : '',
            email: isAuthenticated ? ((user as any)?.email || '') : '',
            contact: options.userPhone || '',
          },
          modal: {
            ondismiss: () => {
              setLoadingPlanId(null);
              document.querySelectorAll('.razorpay-container').forEach((node) => node.remove());
            },
          },
          handler: async (response: any) => {
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
              options.onPaymentSuccess();
            } catch (err) {
              console.error('Payment verification failed', err);
              alert('Payment verification failed. Please contact support.');
            } finally {
              setLoadingPlanId(null);
            }
          },
        };

        if (isSubscription) {
          paymentOptions.subscription_id = orderData.subscriptionId;
        } else {
          paymentOptions.order_id = orderData.orderId;
          paymentOptions.amount = order.amount;
          paymentOptions.currency = order.currency;
        }

        const paymentObject = new (window as any).Razorpay(paymentOptions);
        paymentObject.on('payment.failed', () => setLoadingPlanId(null));
        paymentObject.open();
      } catch (err) {
        console.error('Failed to process subscription', err);
        alert('Failed to initiate payment. Please try again.');
        setLoadingPlanId(null);
      }
    },
    [
      authLoading,
      isAuthenticated,
      options,
      razorpayKeyId,
      requireAuthRedirect,
      user,
    ]
  );

  const handleDowngrade = useCallback(
    async (plan: Plan) => {
      if (!authLoading && !isAuthenticated) {
        requireAuthRedirect(plan);
        return;
      }

      if (
        !confirm(
          `Are you sure you want to downgrade to ${plan.name}? The change will take effect at the end of your current billing cycle.`
        )
      ) {
        return;
      }

      setLoadingPlanId(plan.planId);
      try {
        await apiService.downgradeSubscription(plan.planId);
        alert(`Your downgrade to ${plan.name} has been scheduled.`);
        options.onPaymentSuccess();
      } catch (err) {
        console.error('Failed to downgrade', err);
        alert('Failed to schedule downgrade. Please try again.');
      } finally {
        setLoadingPlanId(null);
      }
    },
    [authLoading, isAuthenticated, options, requireAuthRedirect]
  );

  return {
    loadingPlanId,
    handleSubscribe,
    handleDowngrade,
    razorpayKeyId,
  };
}
