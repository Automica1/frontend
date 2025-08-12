// app/components/Service_Slug/ServicesSidebar.tsx
import React from 'react';
import { 
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react';

interface Service {
  title: string;
  slug: string;
  gradient: string;
  icon: React.ComponentType<any>;
}

interface ServicesSidebarProps {
  services: Service[]; // Made required - no default fallback
  currentService: string;
  onServiceChange: (slug: string) => void;
  gradient: string;
}

export default function ServicesSidebar({ 
  services, // Now required, no default
  currentService, 
  onServiceChange,
  gradient
}: ServicesSidebarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isFixed, setIsFixed] = React.useState(true);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      const sidebar = sidebarRef.current;
      
      if (!footer || !sidebar) return;

      const footerRect = footer.getBoundingClientRect();
      const sidebarHeight = sidebar.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate if footer is coming into view and if sidebar would overlap
      const footerTopInView = footerRect.top <= viewportHeight;
      const sidebarBottomPosition = 80 + sidebarHeight; // top-20 (80px) + sidebar height
      const wouldOverlapFooter = footerTopInView && sidebarBottomPosition > footerRect.top;
      
      setIsFixed(!wouldOverlapFooter);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Check initial state
    handleScroll();
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Early return if no services provided
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <>
      {/* Hide Scrollbar Styles - No space reserved */}
      <style jsx global>{`
        .no-scrollbar {
          overflow: overlay;
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar { 
          width: 0px;
          background: transparent;
          display: none;
        }
        /* Fallback for browsers that don't support overlay */
        @supports not (overflow: overlay) {
          .no-scrollbar {
            overflow-y: auto;
            margin-right: -17px;
            padding-right: 17px;
          }
        }
      `}</style>
      
      <div className={`${isFixed ? 'fixed' : 'absolute'} top-20 left-0 z-30 h-96 transition-all duration-300 ease-out`} ref={sidebarRef}>
        <div className={`h-full transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
          {/* Background */}
          <div className={`absolute inset-0 transition-all duration-300 ${
            isExpanded 
              ? 'bg-gradient-to-r from-black/40 to-black/10 backdrop-blur-xl' 
              : 'bg-gradient-to-r from-black/20 to-black/5 backdrop-blur-md'
          }`} />
          
          {/* Content */}
          <div className="relative h-full">
            {isExpanded ? (
              // Expanded State
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white text-sm font-medium">Services</h4>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-white"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 max-h-80 no-scrollbar">
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
              // Collapsed State - More obvious design
              <div className="h-full flex flex-col">
                {/* Header with expand button */}
                <div className="p-3 border-b border-white/10">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white group"
                    title="Expand services"
                  >
                    <Menu className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>
                
                {/* Services list */}
                <div className="flex-1 p-2 space-y-2 no-scrollbar">
                  {services.map((service) => {
                    const ServiceIcon = service.icon;
                    const isActive = currentService === service.slug;
                    
                    return (
                      <div key={service.slug} className="relative group">
                        <button
                          onClick={() => onServiceChange(service.slug)}
                          className={`w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                            isActive 
                              ? `bg-gradient-to-br ${service.gradient} shadow-md` 
                              : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                          }`}
                          title={service.title}
                        >
                          <ServiceIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`} />
                        </button>
                        
                        {/* Tooltip */}
                        <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 delay-300">
                          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg border border-white/20">
                            {service.title}
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900/95 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Expand hint at bottom */}
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-center p-1 text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 animate-pulse" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Subtle glow effect for collapsed state */}
        {!isExpanded && (
          <div className="absolute inset-0 -z-10">
            <div className={`absolute left-0 top-8 w-16 h-16 bg-gradient-to-r ${gradient} opacity-10 blur-xl rounded-full`} />
          </div>
        )}
      </div>
    </>
  );
}