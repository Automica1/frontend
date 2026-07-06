// app/services/[slug]/SolutionPageClient.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  PenTool,
  User,
  Scissors,
  Table,
  Cpu,
} from 'lucide-react';

// Import separate components
import AboutComponent from '../../components/Service_Slug/AboutComponent';
import TryAPIComponent from '../../components/Service_Slug/TryAPIComponent';
import DocumentationComponent from '../../components/Service_Slug/DocumentationComponent';
import SolutionNavbar from '../../components/Service_Slug/SolutionNavbar';
import ServicesSidebar from '../../components/Service_Slug/ServiceSidebar';
import MobileSwipeIndicator from '../../components/Service_Slug/MobileSwipeIndicator';
import { storeGuestPassKey } from '../../lib/guestPassStorage';

interface SerializableSolution {
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
  hasBeta?: boolean;
  requiresGpuPool?: boolean;
  betaServiceTag?: string;
}

interface SerializableService {
  title: string;
  slug: string;
  gradient: string;
  // icon will be resolved client-side
}

interface SolutionPageClientProps {
  solution: SerializableSolution;
  services: SerializableService[];
  onServiceChange?: (slug: string) => void;
  isAdmin?: boolean;
}

type ActiveSection = 'about' | 'try-api' | 'documentation';

// Icon mapping based on solution slug or title
const getIconForSolution = (slug: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'qr-extract': QrCode,
    'signature-verification': PenTool,
    'id-crop': Table,
    'document-enhancement': FileText,
    'qr-masking': QrCode,
    'face-verify': User,
    'face-cropping': Scissors,
    'ocr-engine': Cpu,
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
    'Document Verification': PenTool,
    'Document Authentication': Shield,
    'Banking & Finance': Database,
    'Insurance Claims': Zap,
    'Legal Documents': FileText,
    'Contract Validation': Shield,
  };
  
  return iconMap[title] || Zap;
};

export default function SolutionPageClient({ 
  solution, 
  services,
  onServiceChange,
  isAdmin = false,
}: SolutionPageClientProps) {
  const searchParams = useSearchParams();
  const accessFromUrl = searchParams?.get('access')?.trim() ?? '';
  const tabFromUrl = searchParams?.get('tab');
  const initialSection: ActiveSection =
    tabFromUrl === 'try-api' || accessFromUrl ? 'try-api' : 'about';

  const [activeSection, setActiveSection] = useState<ActiveSection>(initialSection);
  const router = useRouter();

  useEffect(() => {
    if (accessFromUrl) {
      storeGuestPassKey(accessFromUrl);
      setActiveSection('try-api');

      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.delete('access');
      const query = params.toString();
      router.replace(`/services/${solution.slug}${query ? `?${query}` : ''}`, { scroll: false });
    } else if (tabFromUrl === 'try-api') {
      setActiveSection('try-api');
    }
  }, [accessFromUrl, tabFromUrl, router, searchParams, solution.slug]);

  const handleServiceChange = (slug: string) => {
    console.log('Service clicked:', slug);
    
    // Call parent callback if provided
    if (onServiceChange) {
      onServiceChange(slug);
    }
    
    // Navigate to the new service page
    try {
      router.push(`/services/${slug}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to window.location
      window.location.href = `/services/${slug}`;
    }
  };

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
      slug: solution.slug,
      hasBeta: solution.hasBeta,
      requiresGpuPool: solution.requiresGpuPool,
      betaServiceTag: solution.betaServiceTag,
    };

    switch (activeSection) {
      case 'about':
        return <AboutComponent solution={solutionWithIcon} onSectionChange={setActiveSection} />;
      case 'try-api':
        return (
          <TryAPIComponent
            solution={tryApiSolution}
            initialAccessCode={accessFromUrl || undefined}
            isAdmin={isAdmin}
          />
        );
      case 'documentation':
        return <DocumentationComponent solution={solutionWithIcon} />;
      default:
        return <AboutComponent solution={solutionWithIcon} onSectionChange={setActiveSection} />;
    }
  };

  // Transform services data to include resolved icons
  const servicesWithIcons = services.map(service => ({
    ...service,
    icon: getIconForSolution(service.slug),
  }));

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Solution Navigation Bar */}
      <SolutionNavbar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        gradient={solution.gradient}
      />

      {/* Mobile Services Navigation - Only show if we have multiple services */}
      {servicesWithIcons.length > 1 && (
        <MobileSwipeIndicator
          services={servicesWithIcons}
          currentService={solution.slug}
          onServiceChange={handleServiceChange}
          gradient={solution.gradient}
        />
      )}

      {/* Desktop Sidebar - Only visible on desktop */}
      <div className="hidden lg:block">
        <ServicesSidebar 
          services={servicesWithIcons}
          currentService={solution.slug}
          onServiceChange={handleServiceChange}
          gradient={solution.gradient}
        />
      </div>

      {/* Main Content Area - Updated padding for left sidebar */}
      <div className="pt-12 pr-4 sm:pt-16 md:pt-20 lg:pt-12 lg:pl-14 xl:pl-16">
        {renderActiveComponent()}
      </div>
    </div>
  );
}