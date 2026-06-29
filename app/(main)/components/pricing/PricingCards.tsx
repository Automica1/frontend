'use client';

import React, { useEffect, useState } from 'react';
import { Star, Zap, Crown } from 'lucide-react';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import Link from 'next/link';
import { PricingCardUI } from './PricingCardUI';
import { useRouter } from 'next/navigation';
import { apiService, Plan } from '../../lib/apiService';
import {
  BillingCurrency,
  SUPPORTED_CURRENCIES,
  currencyLabel,
  detectBillingCurrency,
  formatPlanPrice,
  persistBillingCurrency,
} from '../../lib/billingCurrency';

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCurrency, setBillingCurrency] = useState<BillingCurrency>('USD');

  useEffect(() => {
    const currency = detectBillingCurrency();
    setBillingCurrency(currency);
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await apiService.getActivePlans(billingCurrency);
        setPlans(data);
      } catch (error) {
        console.error('Failed to load pricing plans', error);
      }
    };
    void loadPlans();
  }, [billingCurrency]);

  const handleCurrencyChange = (currency: BillingCurrency) => {
    setBillingCurrency(currency);
    persistBillingCurrency(currency);
  };

  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

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

          <div className="flex flex-col items-center gap-3 mt-8">
            <p className="text-xs uppercase tracking-widest text-gray-500">Billing currency</p>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => handleCurrencyChange(currency)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    billingCurrency === currency
                      ? 'bg-purple-500/20 text-purple-200'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {currencyLabel(currency)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {sortedPlans.map((plan, index) => {
            const isEnterprise = plan.name.toLowerCase() === 'enterprise';
            return (
              <PricingCardUI
                key={plan.planId}
                name={plan.name}
                price={isEnterprise ? 'Custom' : `${formatPlanPrice(plan.price, billingCurrency)} / month`}
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
                    router.push('/subscription');
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
