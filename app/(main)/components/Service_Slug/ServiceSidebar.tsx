// app/components/Service_Slug/ServicesSidebar.tsx
import React from 'react';
import { 
  QrCode, 
  FileText, 
  Scan, 
  Search,
  Shield,
  ChevronRight,
  X,
  PenTool
} from 'lucide-react';

interface Service {
  title: string;
  slug: string;
  gradient: string;
  icon: React.ComponentType<any>;
}

interface ServicesSidebarProps {
  services?: Service[];
  currentService: string;
  onServiceChange: (slug: string) => void;
  gradient: string;
}

// Updated default services with new routes
const defaultServices: Service[] = [
  {
    title: 'QR Extract',
    slug: 'qr-extract',
    gradient: 'from-blue-500 to-purple-600',
    icon: QrCode,
  },
  {
    title: 'Signature Verification',
    slug: 'signature-verification',
    gradient: 'from-green-500 to-teal-600',
    icon: PenTool,
  },
  {
    title: 'ID Crop',
    slug: 'id-crop',
    gradient: 'from-orange-500 to-red-600',
    icon: FileText,
  },
  {
    title: 'QR Masking',
    slug: 'qr-masking',
    gradient: 'from-purple-500 to-pink-600',
    icon: QrCode,
  },
  {
    title: 'Face Verify',
    slug: 'face-verify',
    gradient: 'from-yellow-500 to-orange-600',
    icon: Shield,
  },
  {
    title: 'Face Cropping',
    slug: 'face-cropping',
    gradient: 'from-cyan-500 to-blue-600',
    icon: Scan,
  },
];

export default function ServicesSidebar({ 
  services = defaultServices, 
  currentService, 
  onServiceChange,
  gradient
}: ServicesSidebarProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
        }
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>
      
      <div 
        className="fixed top-20 right-0 z-30 h-96 transition-all duration-300 ease-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`h-full transition-all duration-300 ${isHovered ? 'w-64' : 'w-6'}`}>
          {/* Ultra-subtle background */}
          <div className={`absolute inset-0 transition-all duration-300 ${
            isHovered 
              ? 'bg-gradient-to-l from-black/40 to-black/10 backdrop-blur-xl' 
              : 'bg-gradient-to-l from-white/5 to-transparent'
          }`} />
          
          {/* Content */}
          <div className="relative h-full">
            {isHovered ? (
              // Expanded State
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white text-sm font-medium">Services</h4>
                  <div className={`w-6 h-0.5 bg-gradient-to-r ${gradient} rounded-full`} />
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {services.map((service) => {
                    const ServiceIcon = service.icon;
                    const isActive = currentService === service.slug;
                    
                    return (
                      <button
                        key={service.slug}
                        onClick={() => onServiceChange(service.slug)}
                        className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/10 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {/* Service indicator line */}
                        <div className={`w-0.5 h-5 rounded-full bg-gradient-to-b ${service.gradient} ${
                          isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
                        } transition-opacity duration-200`} />
                        
                        {/* Service icon */}
                        <div className={`p-1.5 rounded-md bg-gradient-to-br ${service.gradient} ${
                          isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'
                        } transition-opacity duration-200`}>
                          <ServiceIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        
                        {/* Service name */}
                        <span className="flex-1 text-left text-xs font-medium">
                          {service.title}
                        </span>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient}`} />
                        )}
                        
                        {/* Arrow for non-active items */}
                        {!isActive && (
                          <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Minimized State - Just dots/indicators
              <div className="p-2 pt-6 space-y-3 flex flex-col items-center">
                {services.map((service) => {
                  const ServiceIcon = service.icon;
                  const isActive = currentService === service.slug;
                  
                  return (
                    <div key={service.slug} className="relative group">
                      <button
                        onClick={() => onServiceChange(service.slug)}
                        className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                          isActive 
                            ? `bg-gradient-to-br ${service.gradient} shadow-md` 
                            : 'bg-white/20 hover:bg-white/30 hover:scale-110'
                        }`}
                        title={service.title}
                      >
                        {isActive && (
                          <ServiceIcon className="w-2 h-2 text-white" />
                        )}
                      </button>
                      
                      {/* Tooltip */}
                      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg border border-white/10">
                          {service.title}
                          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/90 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}