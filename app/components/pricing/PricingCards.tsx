import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { HoverBorderGradient } from '../ui/hover-border-gradient';


const PricingCards = () => {
  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for small teams getting started",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Up to 5 team members",
        "10 automation workflows",
        "Basic analytics",
        "Email support",
        "API access",
        "Cloud storage (10GB)"
      ],
      gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
      borderGradient: "from-blue-500/50 to-purple-500/50",
      popular: false
    },
    {
      name: "Professional",
      price: "79",
      period: "month",
      description: "Advanced features for growing businesses",
      icon: <Star className="w-6 h-6" />,
      features: [
        "Up to 25 team members",
        "Unlimited automation workflows",
        "Advanced analytics & reports",
        "Priority support",
        "Advanced API access",
        "Cloud storage (100GB)",
        "Custom integrations",
        "Advanced security"
      ],
      gradient: "from-purple-500/20 via-pink-500/20 to-orange-500/20",
      borderGradient: "from-purple-500/50 to-pink-500/50",
      popular: true
    },
    {
      name: "Enterprise",
      price: "199",
      period: "month",
      description: "Complete solution for large organizations",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Unlimited team members",
        "Enterprise automation suite",
        "Custom analytics dashboard",
        "24/7 dedicated support",
        "Enterprise API & webhooks",
        "Unlimited cloud storage",
        "White-label solutions",
        "Advanced security & compliance",
        "Custom onboarding"
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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm font-medium">
              Pricing Plans
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Scale your automation journey with flexible pricing designed for teams of all sizes
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group ${
                plan.popular ? 'md:-mt-8 md:mb-8' : ''
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full rounded-2xl backdrop-blur-xl border transition-all duration-500 hover:scale-105 group-hover:shadow-2xl ${
                  plan.popular
                    ? 'bg-white/[0.08] border-white/20 shadow-xl'
                    : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${plan.gradient.replace('from-', '').replace('via-', ', ').replace('to-', ', ')})`,
                }}
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-8">
                  {/* Plan header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.borderGradient} text-white`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
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
                  <button
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
                    }`}
                  >
                    {plan.popular ? 'Start Free Trial' : 'Get Started'}
                  </button>
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
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black cursor-pointer bg-white text-black dark:text-white flex items-center space-x-2"
      >
        
        <span>Contact Sales</span>
      </HoverBorderGradient>
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
