'use client';

import React from 'react';
import { Star, Zap, Crown } from 'lucide-react';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import Link from 'next/link';
import { PricingCardUI } from './PricingCardUI';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useDualCurrencyPlans } from '../../hooks/useDualCurrencyPlans';
import { formatPlanPrice, persistBillingCurrency } from '../../lib/billingCurrency';
import { BillingCurrencyToggle } from '../subscription/BillingCurrencyToggle';
import { buildLoginPath } from '../../lib/authPaths';

const getPlanIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'starter':
      return <Zap className="w-6 h-6" />;
    case 'professional':
    case 'pro':
    case 'pro plan':
      return <Star className="w-6 h-6" />;
    case 'enterprise':
      return <Crown className="w-6 h-6" />;
    default:
      return <Zap className="w-6 h-6" />;
  }
};

const PricingCards = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useKindeAuth();
  const {
    plans,
    billingCurrency,
    setCurrency,
    loading,
    regionConfidence,
    showCurrencyToggle,
  } = useDualCurrencyPlans();

  const goToSubscription = (currency: typeof billingCurrency) => {
    persistBillingCurrency(currency, true);
    const target = `/subscription?currency=${currency}`;
    if (!authLoading && !isAuthenticated) {
      router.push(buildLoginPath(target));
      return;
    }
    router.push(target);
  };

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
            Scale your automation journey with flexible pricing designed for teams of all sizes
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

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {(loading ? [] : plans).map((plan, index) => {
            const isEnterprise = plan.name.toLowerCase() === 'enterprise';
            const priceLabel = isEnterprise
              ? 'Custom'
              : `${formatPlanPrice(plan.price, billingCurrency)} / month`;

            return (
              <PricingCardUI
                key={plan.planId}
                name={plan.name}
                price={
                  <motion.span
                    key={`${plan.planId}-${billingCurrency}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {priceLabel}
                  </motion.span>
                }
                description={plan.description || 'The perfect plan to accelerate your business with Automica AI'}
                icon={getPlanIcon(plan.name)}
                features={[
                  `${plan.credits.toLocaleString()} AI credits included`,
                  'Use with any API',
                  'Email support (24 hr response)',
                  'Secure key management & audit logs',
                ]}
                popular={plan.name.toLowerCase() === 'professional' || plan.name.toLowerCase() === 'pro'}
                index={index}
                onButtonClick={() => {
                  if (isEnterprise) {
                    router.push('/contact');
                  } else {
                    goToSubscription(billingCurrency);
                  }
                }}
                buttonText={isEnterprise ? 'Contact Support' : 'Get Started'}
              />
            );
          })}
        </div>

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
