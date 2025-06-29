'use client';

import React from 'react';
import { Brain, Zap, Globe, Target, ArrowRight } from 'lucide-react';

const WhatWeDo: React.FC = () => {
  const services = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI APIs for Real-time Insights",
      description: "Access our powerful AI APIs to extract real-time insights from images, documents, and more."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Custom AI Model Training",
      description: "Train custom AI models tailored to your specific business needs and use cases."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Seamless Workflow Integration",
      description: "Easily integrate our AI solutions into your existing workflows and systems."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast, Scalable, and Secure",
      description: "Enterprise-grade security with high performance and scale for businesses of all sizes."
    }
  ];

  return (
    <section className="relative bg-black text-white overflow-hidden py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            What We Do
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We believe intelligence should be accessible everywhere. Our platform brings 
            sophisticated AI capabilities to every corner of industry, making the complex simple 
            and the impossible achievable.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-black/50 border border-gray-600 hover:border-gray-400 transition-all duration-300 hover:bg-black/70"
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center text-black group-hover:scale-105 transition-transform duration-200">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button className="group inline-flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105">
            <span>Discover all our solutions</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-1/3 left-1/5 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/3 left-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default WhatWeDo;