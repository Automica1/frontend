// app/solutions/[slug]/components/AboutComponent.tsx
"use client";
import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

type ActiveSection = 'about' | 'try-api' | 'documentation';

interface AboutComponentProps {
  solution: {
    title: string;
    tagline: string;
    description: string;
    icon: React.ComponentType<any>;
    gradient: string;
    features?: string[];
    useCases?: Array<{
      title: string;
      description: string;
      icon: React.ComponentType<any>;
    }>;
  };
  onSectionChange: (section: ActiveSection) => void;
}

export default function AboutComponent({ solution, onSectionChange }: AboutComponentProps) {
  const Icon = solution.icon;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <section className="pt-14 pb-16 ">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>API Solution</span>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${solution.gradient} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                    {solution.title}
                  </h1>
                </div>
                
                <p className="text-xl text-purple-300 font-medium">
                  {solution.tagline}
                </p>
                
                <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                  {solution.description}
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onSectionChange('try-api')}
                  className={`px-8 py-4 bg-gradient-to-r ${solution.gradient} rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2`}
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onSectionChange('documentation')}
                  className="px-8 py-4 border border-gray-600 rounded-xl font-semibold hover:border-purple-500 transition-colors duration-300"
                >
                  View Documentation
                </button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} rounded-3xl blur-3xl opacity-20`} />
              <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-700">
                <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Icon className="w-24 h-24 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}