import React from 'react'
import { Spotlight } from "../components/ui/spotlight-new";
import PricingCards from '../components/pricing/PricingCards';


export default function page() {
  return (
    <div className="relative">

      <div className="fixed inset-0 h-screen w-full bg-black/[0.96] antialiased bg-grid-white/[0.02] z-0">
        <Spotlight />
      </div>


      <div className="relative z-10">


        {/* Spacer to account for the initial viewport height */}
        <div className="">

            <PricingCards/>
        </div>

        {/* Content Cards - with background for readability */}
          <div className="">
        <div className="relative bg-black/80 backdrop-blur-sm">

          </div>
        </div>
      </div>
        </div>
  )
}