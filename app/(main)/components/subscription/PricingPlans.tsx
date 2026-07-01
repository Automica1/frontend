import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { Loader2 } from 'lucide-react';
import { BillingCurrencyToggle } from './BillingCurrencyToggle';
import { useDualCurrencyPlans } from '../../hooks/useDualCurrencyPlans';
import { useSearchParams } from 'next/navigation';
import { PlanCardGrid } from '../plans/PlanCardGrid';
import { usePlanCheckout } from '../../hooks/usePlanCheckout';

export default function PricingPlans({
  onPaymentSuccess,
  currentSubscription,
}: {
  onPaymentSuccess: () => void;
  currentSubscription?: any;
}) {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useKindeAuth();
  const highlightPlanId = searchParams?.get('plan');

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

  const { loadingPlanId, handleSubscribe, handleDowngrade } = usePlanCheckout({
    billingCurrency: checkoutBillingCurrency,
    currentSubscription,
    onPaymentSuccess,
    userPhone,
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-light">Loading premium plans...</p>
      </div>
    );
  }

  return (
    <>
      {showCurrencyToggle && (
        <div className="flex justify-center mb-8">
          <BillingCurrencyToggle
            value={billingCurrency}
            onChange={setCurrency}
          />
        </div>
      )}
      <PlanCardGrid
        mode="checkout"
        plans={plans}
        billingCurrency={billingCurrency}
        highlightPlanId={highlightPlanId}
        currentSubscription={currentSubscription}
        loadingPlanId={loadingPlanId}
        onSubscribe={handleSubscribe}
        onDowngrade={handleDowngrade}
      />
    </>
  );
}
