// components/services/ServiceCard.tsx
'use client'
import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Service = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  link?: string;
  gradient: string;
  features?: string[];
};

type ServiceCardProps = {
  service: Service;
  isComingSoon?: boolean;
  index: number;
  hoveredCard: number | null;
  setHoveredCard: (index: number | null) => void;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isComingSoon = false, index, hoveredCard, setHoveredCard }) => {
  const Icon = service.icon;
  const router = useRouter();

  const handleCardClick = () => {
    if (!isComingSoon && service.link) {
      router.push(service.link);
    }
  };

  const handleLearnMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click event
    if (!isComingSoon && service.link) {
      router.push(service.link);
    }
  };
  
  return (
    <div
      className={`relative group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-500 hover:border-purple-500/50 hover:bg-gray-800/50 ${
        isComingSoon ? 'opacity-75' : 'cursor-pointer'
      }`}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={handleCardClick}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
      
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
          Coming Soon
        </div>
      )}
      
      {/* Icon */}
      <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
          {service.title}
        </h3>
        
        <p className="text-gray-300 text-sm leading-relaxed">
          {service.description}
        </p>
        
        {/* Features */}
        {service.features && (
          <div className="space-y-2">
            {service.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="text-gray-400">{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* CTA Button */}
        {!isComingSoon && (
          <div className="pt-4">
            <button 
              onClick={handleLearnMoreClick}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors duration-300 group/btn"
            >
              <span className="text-sm font-medium">Learn More</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
           style={{
             background: `linear-gradient(45deg, transparent, ${hoveredCard === index ? 'rgba(147, 51, 234, 0.1)' : 'transparent'}, transparent)`
           }} />
    </div>
  );
};

export default ServiceCard;