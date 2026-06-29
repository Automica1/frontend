import React, { Suspense } from 'react';
import { Spotlight } from "../components/ui/spotlight-new";
import PricingCards from '../components/pricing/PricingCards';

export default function page() {
  return (
    <div className="relative">
      <div className="fixed inset-0 h-screen w-full bg-black/[0.96] antialiased bg-grid-white/[0.02] z-0">
        <Spotlight />
      </div>

      <div className="relative z-10">
        <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading plans…</div>}>
          <PricingCards />
        </Suspense>
      </div>
    </div>
  );
}
