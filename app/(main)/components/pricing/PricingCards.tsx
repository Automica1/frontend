'use client';

import React from 'react';
import Link from 'next/link';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import { PlanPickerSection } from '../plans/PlanPickerSection';
import { useCredits } from '../../hooks/useCredits';

const PricingCards = () => {
  const { isAuthenticated, isLoading: authLoading } = useKindeAuth();
  const { subscription, refreshCredits } = useCredits();

  const hasActiveSubscription = subscription?.status === 'active';
  const signedIn = !authLoading && isAuthenticated;

  const subtitle = signedIn
    ? hasActiveSubscription
      ? 'Upgrade, downgrade, or manage your plan below — billing details are on your subscription page.'
      : 'Choose a plan below to subscribe. You can manage billing anytime from your subscription page.'
    : 'Compare plans below — sign in to subscribe and manage billing.';

  return (
    <div className="relative py-20 px-4">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
              Pricing Plans
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
          </div>

          <h2 className="text-5xl lg:text-7xl font-light text-white tracking-tighter leading-tight mb-8">
            Choose Your <span className="text-purple-400">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            {subtitle}
          </p>
          {signedIn && (
            <p className="mt-4 text-sm text-purple-300/90">
              <Link href="/subscription" className="underline hover:text-purple-200">
                View balance &amp; cancel subscription
              </Link>
            </p>
          )}
        </div>

        <PlanPickerSection
          currentSubscription={subscription}
          onPaymentSuccess={refreshCredits}
          loginReturnPath="/pricing"
        />

        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6 font-light">
            Need a custom solution? We&apos;ve got you covered.
          </p>

          <div className="flex justify-center text-center">
            <Link href="/contact">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black cursor-pointer bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <span className="font-light">Contact Sales</span>
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCards;
