'use client';

import React from 'react';
import { Star, Zap, Crown } from 'lucide-react';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import Link from 'next/link';
import { PricingCardUI } from './PricingCardUI';
import { useRouter } from 'next/navigation';

const PricingCards = () => {
  const router = useRouter();
  const plans = [
    {
      name: "Starter",
      price: "$12",
      period: "/ month",
      description: "Everything you need to start integrating AI into your projects",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "1000 AI credits included",
        "Use with any API",
        "Email support (24 hr response)",
        "Secure key management & audit logs"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/ month",
      description: "Advanced tools and support for growing teams",
      icon: <Star className="w-6 h-6" />,
      features: [
        "9000 AI credits included",
        "Advanced features for growing teams",
        "Use with any API (higher limits)",
        "Priority support",
        "Advanced analytics & reports",
        "Custom integrations & webhooks (limited)",
        "Secure key management & audit logs"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Comprehensive AI solutions tailored for large organizations",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Unlimited AI credits (volume-based)",
        "Tailored for large organizations",
        "Dedicated SLA & 24/7 support",
        "Custom integrations & deployment options",
        "Secure key management & audit logs"
      ],
      popular: false
    }
  ];

  return (
    <div className="relative py-20 px-4">
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
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
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <PricingCardUI
              key={plan.name}
              {...plan}
              index={index}
              onButtonClick={() => {
                if (plan.name === "Enterprise") {
                  router.push("/contact");
                } else {
                  router.push("/subscription");
                }
              }}
              buttonText={plan.name === "Enterprise" ? "Contact Support" : "Get Started"}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6 font-light">
            Need a custom solution? We've got you covered.
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