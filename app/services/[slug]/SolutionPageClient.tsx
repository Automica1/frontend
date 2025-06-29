// app/solutions/[slug]/SolutionPageClient.tsx
"use client";
import React, { useState } from 'react';
import Navbar from '../../components/landingPage/Navbar';
import Footer from '../../components/landingPage/Footer';
import { FloatingDock } from '@/app/components/ui/floating-dock';
import {
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";

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
  Zap
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

  const links = [
    {
      title: "About",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => setActiveSection('about'),
    },
    {
      title: "Try API",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => setActiveSection('try-api'),
    },
    {
      title: "Docs",
      icon: (
        <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => setActiveSection('documentation'),
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
    <div className=" bg-black text-white">
      {/* Main Content Area */}
      <div className="pt-20">
        {renderActiveComponent()}
      </div>

      {/* Floating Dock with Text Labels */}
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50">
        <FloatingDock
          mobileClassName="translate-y-20"
          items={links}
        />
      </div>
    </div>
  );
}