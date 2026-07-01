import React from 'react';
import { PlanPickerSection } from '../plans/PlanPickerSection';

export default function PricingPlans({
  onPaymentSuccess,
  currentSubscription,
}: {
  onPaymentSuccess: () => void;
  currentSubscription?: any;
}) {
  return (
    <PlanPickerSection
      currentSubscription={currentSubscription}
      onPaymentSuccess={onPaymentSuccess}
      loginReturnPath="/subscription"
    />
  );
}
