import React from 'react';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import Link from 'next/link';


const PricingCards = () => {
  const plans = [
    {
      name: "Starter",
      price: "$ 12 / month",
      period: "month",
      description: "Everything you need to start integrating AI into your projects",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "1000 AI credits included",
        "Use with any API",
        "Email support (24 hr response)",
        "Secure key management & audit logs"
      ],
      gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
      borderGradient: "from-blue-500/50 to-purple-500/50",
      popular: false
    },
    {
      name: "Professional",
      price: "$ 99 / month",
      period: "month",
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
      gradient: "from-purple-500/20 via-pink-500/20 to-orange-500/20",
      borderGradient: "from-purple-500/50 to-pink-500/50",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom pricing",
      // period: "month",
      description: "Comprehensive AI solutions tailored for large organizations",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Unlimited AI credits (volume-based)",
        "Tailored for large organizations",
        "Dedicated SLA & 24/7 support",
        "Custom integrations & deployment options",
        "Secure key management & audit logs"
      ],
      gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
      borderGradient: "from-orange-500/50 to-red-500/50",
      popular: false
    }
  ];

  return (
    <div className="relative py-20 px-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0  pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
              Pricing Plans
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
          </div>

          <h2 className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight mb-8">
            Choose Your <span className="text-purple-400">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Scale your automation journey with flexible pricing designed for teams of all sizes
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group ${plan.popular ? 'md:-mt-8 md:mb-8' : ''
                }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-800 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg shadow-purple-500/30">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full rounded-3xl backdrop-blur-xl border transition-all duration-500 hover:scale-105 group-hover:shadow-2xl ${plan.popular
                  ? 'bg-white/[0.08] border-purple-500/30 shadow-xl'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-purple-500/20'
                  }`}
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8 lg:p-10">
                  {/* Plan header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 text-white group-hover:scale-110 transition-transform duration-500`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-light text-white tracking-tight">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-light tracking-tight text-white">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-gray-400 text-base font-light mt-3 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/contact" className="block mt-8">
                    <button
                      className={`group relative w-full inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer ${plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-600 hover:to-purple-900'
                        : 'bg-white/5 border border-white/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-800 hover:border-transparent'
                        }`}
                    >
                      <span className="mr-3">{plan.popular ? 'Start Free Trial' : 'Get Started'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                {/* Floating elements for visual interest */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Need a custom solution? We've got you covered.
          </p>

          <div className="flex justify-center text-center">
            <Link href="/contact">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black cursor-pointer bg-white text-black dark:text-white flex items-center space-x-2"
              >
                <span>Contact Sales</span>
              </HoverBorderGradient>
            </Link>
          </div>
          {/* <button className="inline-flex items-center px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            Contact Sales
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default PricingCards;