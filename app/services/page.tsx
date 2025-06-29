// app/services/page.tsx
import React from 'react'
import Navbar from '../components/landingPage/Navbar'
import Hero from '../components/services/Hero'
import { CanvasRevealEffectDemo } from '../components/services/Demo'
import { CarouselDemo } from '../components/services/Carousel'
import ServicesShowcase from '../components/services/ServiceShowcase'
import AvailableSolutions from '../components/services/AvailableSolutions'
import ComingSoon from '../components/services/ComingSoon'
import CTASection from '../components/services/CTASection'
import Footer from '../components/landingPage/Footer'

export default function page() {
  return (
    <div>
      {/* <Navbar /> */}
      {/* <Hero />       */}
      
      <CanvasRevealEffectDemo />
      
      {/* Option 1: Use the complete ServicesShowcase component */}
      <ServicesShowcase />
      {/* <Footer/> */}
      
      {/* Option 2: Use individual components if you want more control */}
      {/* 
      <div className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AvailableSolutions hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
          <ComingSoon hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} solutionsCount={6} />
          <CTASection />
        </div>
      </div>
      */}
      
      {/* <CarouselDemo/> */}
    </div>
  )
}