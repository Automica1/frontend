'use client';

import React from 'react';
import Link from 'next/link';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import { useDualCurrencyPlans } from '../../hooks/useDualCurrencyPlans';
import { BillingCurrencyToggle } from '../subscription/BillingCurrencyToggle';
import { PlanCardGrid } from '../plans/PlanCardGrid';

const PricingCards = () => {
  const {
    plans,
    billingCurrency,
    setCurrency,
    loading,
    regionConfidence,
    showCurrencyToggle,
  } = useDualCurrencyPlans();

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
            Compare plans below — sign in to subscribe and manage billing on your account page
          </p>

          {showCurrencyToggle && (
            <div className="mt-8">
              <BillingCurrencyToggle
                value={billingCurrency}
                onChange={setCurrency}
                regionConfidence={regionConfidence}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 font-light">Loading plans…</div>
        ) : (
          <PlanCardGrid mode="marketing" plans={plans} billingCurrency={billingCurrency} />
        )}

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
