// app/components/Service_Slug/MobileSwipeIndicator.tsx
"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface Service {
  title: string;
  shortTitle?: string; // Add this for shorter button text
  slug: string;
  gradient: string;
  icon: React.ComponentType<any>;
}

interface MobileSwipeIndicatorProps {
  services: Service[];
  currentService: string;
  onServiceChange: (slug: string) => void;
  gradient: string;
}

export default function MobileSwipeIndicator({
  services,
  currentService,
  onServiceChange,
  gradient
}: MobileSwipeIndicatorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const currentIndex = services.findIndex(service => service.slug === currentService);
  const currentServiceData = services.find(service => service.slug === currentService);

  const navigateToNext = () => {
    const nextIndex = (currentIndex + 1) % services.length;
    onServiceChange(services[nextIndex].slug);
  };

  const navigateToPrevious = () => {
    const prevIndex = currentIndex === 0 ? services.length - 1 : currentIndex - 1;
    onServiceChange(services[prevIndex].slug);
  };

  if (!currentServiceData || services.length <= 1) return null;

  const CurrentIcon = currentServiceData.icon;
  const displayTitle = currentServiceData.shortTitle || currentServiceData.title;

  return (
    <>
      {/* Option 1: Simple Navigation (recommended) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <div className="flex items-center space-x-2 bg-gray-900/90 backdrop-blur-sm rounded-full px-2 py-2 border border-gray-700 shadow-lg">
          <button
            onClick={navigateToPrevious}
            className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="px-3 py-1 text-white text-xs font-medium">
            {displayTitle}
          </div>
          
          <button
            onClick={navigateToNext}
            className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Alternative Option 2: Dropdown (uncomment to use instead) */}
      {/* 
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2.5 shadow-lg text-white border border-gray-700"
          >
            <CurrentIcon size={16} />
            <span className="font-medium text-sm">{displayTitle}</span>
            <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg border border-gray-700 shadow-xl min-w-full overflow-hidden">
              {services.map((service) => {
                const ServiceIcon = service.icon;
                const serviceDisplayTitle = service.shortTitle || service.title;
                return (
                  <button
                    key={service.slug}
                    onClick={() => {
                      onServiceChange(service.slug);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      service.slug === currentService 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <ServiceIcon size={16} />
                    <span className="text-sm font-medium whitespace-nowrap">{serviceDisplayTitle}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {showDropdown && (
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
      */}

      {/* Alternative Option 3: Just Dots (uncomment to use instead) */}
      {/* 
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <div className="flex items-center space-x-2 bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-3 border border-gray-700 shadow-lg">
          {services.map((service, index) => (
            <button
              key={service.slug}
              onClick={() => onServiceChange(service.slug)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? `bg-white scale-150` 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
      */}
    </>
  );
}