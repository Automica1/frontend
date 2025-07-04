// app/solutions/[slug]/SolutionPageClient.tsx
"use client";
import React, { useState } from 'react';
import Navbar from '../../components/landingPage/Navbar';
import Footer from '../../components/landingPage/Footer';

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
import AboutComponent from '../../components/services/slug_/AboutComponent';
import TryAPIComponent from '../../components/services/slug_/TryAPIComponent';
import DocumentationComponent from '../../components/services/slug_/DocumentationComponent';

interface SolutionPageClientProps {
  solution: {
    title: string;
    slug: string;
    tagline: string;
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
      label: 'Try The Api',
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
        return <AboutComponent solution={solutionWithIcon} />;
      case 'try-api':
        return <TryAPIComponent solution={tryApiSolution} />;
      case 'documentation':
        return <DocumentationComponent solution={solutionWithIcon} />;
      default:
        return <AboutComponent solution={solutionWithIcon} />;
    }
  };

  return (
    <div className="bg-black text-white">
      {/* Navigation Bar - Fixed positioning below main navbar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area - Add top padding to account for both navbars */}
      <div className="pt-32">
        {renderActiveComponent()}
      </div>
    </div>
  );
}