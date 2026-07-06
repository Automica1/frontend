'use client';

import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BillingCurrencyToggle } from '../subscription/BillingCurrencyToggle';
import { useDualCurrencyPlans } from '../../hooks/useDualCurrencyPlans';
import { usePlanCheckout } from '../../hooks/usePlanCheckout';
import { PlanCardGrid } from './PlanCardGrid';
import { ConfirmModal } from '../ui/ConfirmModal';

type PlanPickerSectionProps = {
  currentSubscription?: any;
  onPaymentSuccess?: () => void;
  /** Where guests land after sign-in from a plan CTA (e.g. /pricing or /subscription) */
  loginReturnPath?: string;
  highlightPlanId?: string | null;
};

export function PlanPickerSection({
  currentSubscription,
  onPaymentSuccess,
  loginReturnPath = '/subscription',
  highlightPlanId: highlightPlanIdProp,
}: PlanPickerSectionProps) {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useKindeAuth();
  const highlightPlanId = highlightPlanIdProp ?? searchParams?.get('plan');

  const userPhone = isAuthenticated
    ? ((user as any)?.phone || (user as any)?.phone_number || '')
    : '';

  const {
    plans,
    billingCurrency,
    checkoutCurrency,
    setCurrency,
    loading,
    showCurrencyToggle,
  } = useDualCurrencyPlans({
    phone: userPhone,
    subscriptionCurrency:
      currentSubscription?.status === 'active' ? currentSubscription?.currency : null,
  });

  const checkoutBillingCurrency =
    currentSubscription?.status === 'active' ? checkoutCurrency : billingCurrency;

  const {
    loadingPlanId,
    handleSubscribe,
    requestDowngrade,
    downgradeConfirmPlan,
    downgradeSuccessPlan,
    downgradeRenewedSubscription,
    cancelDowngradeRequest,
    confirmDowngrade,
    dismissDowngradeSuccess,
  } = usePlanCheckout({
    billingCurrency: checkoutBillingCurrency,
    currentSubscription,
    onPaymentSuccess: onPaymentSuccess ?? (() => {}),
    userPhone,
  });

  const useCheckoutMode = !authLoading && isAuthenticated;

  const cancelScheduled = Boolean(
    currentSubscription?.status === 'active' && currentSubscription?.cancelAtCycleEnd
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-light">Loading plans…</p>
      </div>
    );
  }

  return (
    <>
      {showCurrencyToggle && (
        <div className="flex justify-center mb-8">
          <BillingCurrencyToggle value={billingCurrency} onChange={setCurrency} />
        </div>
      )}
      <PlanCardGrid
        mode={useCheckoutMode ? 'checkout' : 'marketing'}
        plans={plans}
        billingCurrency={billingCurrency}
        highlightPlanId={highlightPlanId}
        currentSubscription={currentSubscription}
        loadingPlanId={loadingPlanId}
        loginReturnPath={loginReturnPath}
        onSubscribe={handleSubscribe}
        onDowngrade={requestDowngrade}
      />

      <ConfirmModal
        open={Boolean(downgradeConfirmPlan)}
        title="Schedule downgrade?"
        description={
          downgradeConfirmPlan ? (
            <>
              Are you sure you want to downgrade to{' '}
              <span className="font-medium text-white">{downgradeConfirmPlan.name}</span>? The change
              will take effect at the end of your current billing cycle.
              {cancelScheduled && (
                <>
                  {' '}
                  This also renews your subscription — scheduled cancellation will be removed.
                </>
              )}
            </>
          ) : null
        }
        confirmLabel="Schedule downgrade"
        cancelLabel="Keep current plan"
        onConfirm={confirmDowngrade}
        onCancel={cancelDowngradeRequest}
        loading={Boolean(downgradeConfirmPlan && loadingPlanId === downgradeConfirmPlan.planId)}
        variant="danger"
      />

      <ConfirmModal
        open={Boolean(downgradeSuccessPlan)}
        title="Downgrade scheduled"
        description={
          downgradeSuccessPlan ? (
            <>
              Your downgrade to{' '}
              <span className="font-medium text-white">{downgradeSuccessPlan.name}</span> has been
              scheduled for the end of your current billing cycle.
              {downgradeRenewedSubscription && ' Your subscription will continue renewing.'}
            </>
          ) : null
        }
        confirmLabel="Done"
        onConfirm={dismissDowngradeSuccess}
        onCancel={dismissDowngradeSuccess}
        singleAction
        variant="default"
      />
    </>
  );
}
