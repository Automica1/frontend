"use client";

import React from "react";
import { Shield, Zap, Users, DollarSign, Clock, Sparkles } from "lucide-react";
// WhyChooseUs Component (transparent)
const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption and compliance standards ensuring your data remains protected with 99.9% uptime guarantee.",
    },
    {
      icon: Zap,
      title: "Lightning-Fast Performance",
      description: "Optimized infrastructure delivering sub-second response times that scale seamlessly from startup to enterprise volumes.",
    },
    {
      icon: Users,
      title: "24/7 Expert Support",
      description: "Dedicated AI specialists and engineers providing round-the-clock assistance for integration and optimization.",
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "No hidden fees, predictable costs, and flexible plans that grow with your business while maximizing ROI.",
    },
    {
      icon: Clock,
      title: "Instant Integration",
      description: "Production-ready APIs with comprehensive documentation that integrate in minutes, not weeks.",
    },
    {
      icon: Sparkles,
      title: "Cutting-Edge AI",
      description: "State-of-the-art models and continuous updates keeping you ahead of the curve in AI innovation.",
    },
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
              Why Choose Us
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight mb-8">
            Enterprise <span className="text-purple-400">AI Solutions</span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto font-light leading-relaxed">
            Industry-leading technology that{" "}
            <span className="text-purple-400 font-medium">scales with confidence</span> and{" "}
            <span className="text-white font-medium">delivers results</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-purple-500/20"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
                    linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)
                  `,
                }}
              >
                <div className="relative p-8 z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center backdrop-blur-sm">
                      <IconComponent className="w-6 h-6 text-purple-300" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-light mb-6 text-white tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed text-lg font-light">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />
              </div>
            );
          })}
        </div>

        <div className="flex justify-center items-center mt-20 space-x-4">
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;