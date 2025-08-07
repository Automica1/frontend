// app/components/Service_Slug/MobileSwipeIndicator.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Grid3X3 } from 'lucide-react';

interface Service {
  title: string;
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
  const [isOpen, setIsOpen] = useState(false);
  
  const currentServiceData = services.find(s => s.slug === currentService);
  const currentIndex = services.findIndex(s => s.slug === currentService);

  const nextService = () => {
    const nextIndex = (currentIndex + 1) % services.length;
    onServiceChange(services[nextIndex].slug);
  };

  const prevService = () => {
    const prevIndex = currentIndex === 0 ? services.length - 1 : currentIndex - 1;
    onServiceChange(services[prevIndex].slug);
  };

  return (
    <>
      {/* Swipe Indicator Bar */}
      <div className="fixed top-20 left-0 right-0 z-30 lg:hidden">
        <div className="flex items-center justify-center px-4">
          <div className="flex items-center bg-black/80 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
            {/* Previous Button */}
            <button 
              onClick={prevService}
              className="p-3 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-l-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Current Service Display */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors duration-200"
            >
              {currentServiceData && (
                <>
                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${currentServiceData.gradient} flex-shrink-0`}>
                    <currentServiceData.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-white text-sm font-medium truncate">{currentServiceData.title}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      {services.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                            index === currentIndex
                              ? `bg-gradient-to-r ${currentServiceData.gradient}`
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Grid3X3 className="w-3.5 h-3.5 text-gray-400" />
                </>
              )}
            </button>
            
            {/* Next Button */}
            <button 
              onClick={nextService}
              className="p-3 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-r-full"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Service Grid Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-4 z-50 lg:hidden">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {currentServiceData && (
                    <>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${currentServiceData.gradient}`}>
                        <currentServiceData.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold">Choose Service</h3>
                        <p className="text-gray-400 text-sm">Currently: {currentServiceData.title}</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Services Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {services.map((service) => {
                    const ServiceIcon = service.icon;
                    const isActive = currentService === service.slug;
                    
                    return (
                      <button
                        key={service.slug}
                        onClick={() => {
                          onServiceChange(service.slug);
                          setIsOpen(false);
                        }}
                        className={`group relative p-6 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/15 ring-2 ring-white/20 scale-95' 
                            : 'bg-white/5 hover:bg-white/10 active:scale-95'
                        }`}
                      >
                        {/* Service icon */}
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${service.gradient} mb-4 ${
                          isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                        } transition-opacity`}>
                          <ServiceIcon className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Service title */}
                        <h4 className={`font-medium ${
                          isActive ? 'text-white' : 'text-gray-300'
                        }`}>
                          {service.title}
                        </h4>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}