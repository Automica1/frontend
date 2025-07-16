// components/services/types.ts
import type { LucideIcon } from 'lucide-react';

export interface ServiceCardData {
  title: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  link: string;
  features: string[];
  gradient: string;
}

export interface ServiceCardProps {
  service: ServiceCardData;
  index: number;
  hoveredCard: string | null;
  setHoveredCard: (card: string | null) => void;
}