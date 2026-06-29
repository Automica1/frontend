'use client';

import React from 'react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PricingCardProps {
  name: string;
  price: React.ReactNode;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  index?: number;
}

export const PricingCardUI: React.FC<PricingCardProps> = ({
  name,
  price,
  description,
  features,
  icon,
  popular = false,
  buttonText = 'Get Started',
  onButtonClick,
  isLoading = false,
  disabled = false,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group h-full ${popular ? 'md:-mt-8 md:mb-8' : ''}`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-purple-800 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg shadow-purple-500/30">
            Most Popular
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className={`relative h-full rounded-3xl backdrop-blur-xl border transition-all duration-500 hover:scale-105 group-hover:shadow-2xl flex flex-col ${
          popular
            ? 'bg-white/[0.08] border-purple-500/30 shadow-xl'
            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-purple-500/20'
        }`}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-8 lg:p-10 flex flex-col h-full">
          {/* Plan header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 text-white group-hover:scale-110 transition-transform duration-500`}>
                {icon}
              </div>
              <div>
                <h3 className="text-2xl font-light text-white tracking-tighter">
                  {name}
                </h3>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-baseline">
              <span className="text-5xl font-light tracking-tighter text-white">
                {price}
              </span>
            </div>
            <p className="text-gray-400 text-base font-light mt-3 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-800/30 flex items-center justify-center mt-0.5 border border-purple-500/20">
                  <Check className="w-3 h-3 text-purple-300" />
                </div>
                <span className="text-gray-300 text-sm leading-relaxed font-light">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button
            onClick={onButtonClick}
            disabled={disabled || isLoading}
            className={`group relative w-full inline-flex items-center justify-center px-8 py-4 rounded-lg text-white font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              popular
                ? 'bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-600 hover:to-purple-900'
                : 'bg-white/5 border border-white/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-800 hover:border-transparent'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="mr-3">{buttonText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-lg" />
      </div>
    </motion.div>
  );
};
