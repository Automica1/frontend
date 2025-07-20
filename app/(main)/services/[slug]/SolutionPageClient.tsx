// app/solutions/[slug]/SolutionPageClient.tsx
"use client";
import React, { useState } from 'react';

// Import icons that might be used
import { 
  QrCode, 
  FileText, 
  Image, 
  Scan, 
  Database,
  Brain,
  Camera,
  Search,
  Shield,
  Zap,
  Home,
  Terminal,
  FileCode
} from 'lucide-react';

// Import separate components
import AboutComponent from '../../components/Service_Slug/AboutComponent';
import TryAPIComponent from '../../components/Service_Slug/TryAPIComponent';
import DocumentationComponent from '../../components/Service_Slug/DocumentationComponent';

interface SolutionPageClientProps {
  solution: {
    title: string;
    slug: string;
    tagline: string;
    gifSrc?: string;
    description: string;
    gradient: string;
    apiEndpoint?: string;
    features?: string[];
    useCases?: Array<{
      title: string;
      description: string;
    }>;
    pricing?: any;
    documentation?: any;
    heroImage?: string;
  };
}

type ActiveSection = 'about' | 'try-api' | 'documentation';

// Icon mapping based on solution slug or title
const getIconForSolution = (slug: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'qr-extract': QrCode,
    'sign-verify': Search,
    'id-crop': FileText,
    'qr-masking': QrCode,
    'face-verify': Shield,
    'face-cropping': Scan,
  };
  
  return iconMap[slug] || QrCode;
};

// Icon mapping for use cases
const getUseCaseIcon = (title: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'Retail Analysis': Search,
    'Urban Planning': Shield,
    'Accessibility': Zap,
    'Inventory Management': Database,
    'Event Management': Zap,
    'Document Processing': FileText,
    'Financial Analysis': Shield,
    'Data Migration': Database,
    'Marketing Campaigns': Search,
    'Product Packaging': Shield,
    'Event Branding': Zap,
    'Access Control': Shield,
    'Identity Verification': Database,
    'Attendance Systems': Zap,
    'Profile Pictures': Camera,
    'Employee Photos': Database,
    'ID Processing': Shield,
  };
  
  return iconMap[title] || Zap;
};

export default function SolutionPageClient({ solution }: SolutionPageClientProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('about');

  const navItems = [
    {
      id: 'about' as ActiveSection,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'try-api' as ActiveSection,
      label: 'Try API',
      icon: Terminal,
    },
    {
      id: 'documentation' as ActiveSection,
      label: 'Documentation',
      icon: FileCode,
    },
  ];

  const renderActiveComponent = () => {
    const IconComponent = getIconForSolution(solution.slug);
    
    const solutionWithIcon = {
      ...solution,
      icon: IconComponent,
      useCases: solution.useCases?.map(useCase => ({
        ...useCase,
        icon: getUseCaseIcon(useCase.title)
      })) || [],
    };

    // Prepare the minimal solution object for TryAPIComponent
    const tryApiSolution = {
      title: solution.title,
      IconComponent,
      gradient: solution.gradient,
      apiEndpoint: solution.apiEndpoint,
    };

    switch (activeSection) {
      case 'about':
        return <AboutComponent solution={solutionWithIcon} onSectionChange={setActiveSection} />;
      case 'try-api':
        return <TryAPIComponent solution={tryApiSolution} />;
      case 'documentation':
        return <DocumentationComponent solution={solutionWithIcon} />;
      default:
        return <AboutComponent solution={solutionWithIcon} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
{/* Navigation Bar - Fixed on desktop, scrollable on mobile */}
<div className="fixed top-18 left-0 right-0 z-40 sm:fixed sm:top-18 relative top-0">
  <div className="flex justify-center px-2 sm:px-4 md:px-6 lg:px-8">
    {/* Desktop Navigation - Custom shaped container */}
    <div className="relative hidden sm:block">
      {/* Border shape - larger background with gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${solution.gradient} opacity-100`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 45px) 100%, 45px 100%)'
        }}
      />
      
      {/* Background shape - slightly smaller to create border effect */}
      <div 
        className="absolute bg-black/40 backdrop-blur-xl"
        style={{
          top: '2px',
          left: '2px',
          right: '2px',
          bottom: '2px',
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 45px) 100%, 45px 100%)'
        }}
      />
      
      {/* Content container */}
      <div className="relative px-8 sm:px-12 py-0">
        <nav className="flex justify-center">
          <div className="flex space-x-4 sm:space-x-6 lg:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group relative flex items-center space-x-1.5 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Radio button effect for active state with gradient */}
                  {isActive && (
                    <div className={`absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r ${solution.gradient} rounded-full shadow-md`}>
                      <div className="absolute inset-0.5 bg-white rounded-full"></div>
                    </div>
                  )}
                  
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                  
                  {/* Subtle glow effect on hover with gradient colors */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${solution.gradient} opacity-10 rounded-lg blur-sm -z-10`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>

    {/* Mobile Navigation - Simplified rounded container (scrollable) - REDUCED HEIGHT */}
    <div className="relative sm:hidden w-full max-w-sm">
      {/* Mobile background with gradient border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${solution.gradient} opacity-100 rounded-xl`} />
      
      {/* Mobile inner background */}
      <div className="absolute bg-black/40 backdrop-blur-xl rounded-xl" style={{
        top: '1px',
        left: '1px',
        right: '1px',
        bottom: '1px'
      }} />
      
      {/* Mobile content container - REDUCED PADDING */}
      <div className="relative px-3 py-1">
        <nav className="flex justify-center">
          <div className="flex space-x-1 w-full justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group relative flex flex-col items-center space-y-0.5 py-1 px-2 rounded-lg font-medium text-xs transition-all duration-300 flex-1 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  
                  
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs leading-tight">{item.label}</span>
                  
                  {/* Mobile glow effect */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${solution.gradient} opacity-10 rounded-lg blur-sm -z-10`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  </div>
</div>

      {/* Main Content Area - Responsive top padding */}
      <div className="pt-12 sm:pt-16 md:pt-20">
        {renderActiveComponent()}
      </div>
    </div>
  );
}