'use client';

import { useCallback, useEffect, useState } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService, Plan } from '../lib/apiService';
import { BillingCurrency } from '../lib/billingCurrency';
import { buildLoginPath } from '../lib/authPaths';
import { savePendingCheckout } from '../lib/pendingCheckoutStorage';

export function usePlanCheckout(options: {
  billingCurrency: BillingCurrency;
  currentSubscription?: any;
  onPaymentSuccess: () => void;
  userPhone?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useKindeAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const paymentStatus = searchParams?.get('payment');
    if (paymentStatus === 'success') {
      options.onPaymentSuccess();
    }
  }, [options, searchParams]);

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

      if (loadingPlanId) {
        return;
      }

      setLoadingPlanId(plan.planId);

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

        savePendingCheckout({
          subscriptionId: orderData.subscriptionId,
          orderId: orderData.orderId,
          shortUrl: orderData.shortUrl,
          planId: plan.planId,
          planName: plan.name,
          currency: (order.currency as string) || checkoutCurrency,
          amount: order.amount,
          isUpgrade,
        });

        const params = new URLSearchParams({
          plan: plan.planId,
          currency: checkoutCurrency,
        });
        router.push(`/subscription/pay?${params.toString()}`);
      } catch (err) {
        console.error('Failed to process subscription', err);
        alert('Failed to initiate payment. Please try again.');
      } finally {
        setLoadingPlanId(null);
      }
    },
    [
      authLoading,
      isAuthenticated,
      loadingPlanId,
      options,
      requireAuthRedirect,
      router,
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
    razorpayKeyId: null,
  };
}
