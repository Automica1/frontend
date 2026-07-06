'use client';

import { useCallback, useState } from 'react';
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
  const [downgradeConfirmPlan, setDowngradeConfirmPlan] = useState<Plan | null>(null);
  const [downgradeSuccessPlan, setDowngradeSuccessPlan] = useState<Plan | null>(null);
  const [downgradeRenewedSubscription, setDowngradeRenewedSubscription] = useState(false);

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

  const requestDowngrade = useCallback(
    (plan: Plan) => {
      if (!authLoading && !isAuthenticated) {
        requireAuthRedirect(plan);
        return;
      }
      setDowngradeConfirmPlan(plan);
      setDowngradeRenewedSubscription(Boolean(options.currentSubscription?.cancelAtCycleEnd));
    },
    [authLoading, isAuthenticated, requireAuthRedirect]
  );

  const cancelDowngradeRequest = useCallback(() => {
    if (loadingPlanId) return;
    setDowngradeConfirmPlan(null);
  }, [loadingPlanId]);

  const confirmDowngrade = useCallback(async () => {
    if (!downgradeConfirmPlan) return;

    setLoadingPlanId(downgradeConfirmPlan.planId);
    try {
      await apiService.downgradeSubscription(downgradeConfirmPlan.planId);
      setDowngradeSuccessPlan(downgradeConfirmPlan);
      setDowngradeConfirmPlan(null);
      options.onPaymentSuccess();
    } catch (err) {
      console.error('Failed to downgrade', err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to schedule downgrade. Please try again.';
      alert(message);
    } finally {
      setLoadingPlanId(null);
    }
  }, [downgradeConfirmPlan, options]);

  const dismissDowngradeSuccess = useCallback(() => {
    setDowngradeSuccessPlan(null);
    setDowngradeRenewedSubscription(false);
  }, []);

  return {
    loadingPlanId,
    handleSubscribe,
    requestDowngrade,
    downgradeConfirmPlan,
    downgradeSuccessPlan,
    downgradeRenewedSubscription,
    cancelDowngradeRequest,
    confirmDowngrade,
    dismissDowngradeSuccess,
  };
}
