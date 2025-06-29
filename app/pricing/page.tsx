import React from 'react'
import { Spotlight } from "../components/ui/spotlight-new";
import Navbar from '../components/landingPage/Navbar';
// import Card from '../components/pricing/ACard';
// import Card2 from '../components/pricing/Card2';
// import Card3 from '../components/pricing/Card3';
// import Earth from '../components/pricing/Earth';
// import MasterCard from '../components/pricing/MasterCard';
// import DesignCard from '../components/pricing/DesignCard';
// import AnotherMasterCard from '../components/pricing/AnotherMasterCard';
// import PhoneHoverCard from '../components/pricing/PhoneHoverCard';
// import Kard from '../components/pricing/Kard';
// import Go from '../components/pricing/Go';
// import Business from '../components/pricing/BusinessCard';
// import Transaction from '../components/pricing/NewTransaction';
// import Wallet from '../components/pricing/Wallet';
// import {BackgroundGradientDemo} from '../components/pricing/Cardd'; 
import PricingCards from '../components/pricing/PricingCards';
import Footer from '../components/landingPage/Footer';
// import TiltedCard from '../components/pricing/Testimonial';
// import TiltedCard from '../components/pricing/CardTestimonial';

export default function page() {
  return (
    <div className="relative">
      {/* Fixed Background with Spotlight */}
      <div className="fixed inset-0 h-screen w-full bg-black/[0.96] antialiased bg-grid-white/[0.02] z-0">
        <Spotlight />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Navbar - positioned at top */}
        {/* <div className="relative z-20">
          <Navbar />
        </div> */}

        {/* Spacer to account for the initial viewport height */}
        <div className="">

            <PricingCards/>
        </div>

        {/* Content Cards - with background for readability */}
          <div className="">
  
            {/* <Card /> */}
            {/* <Card3 /> */}
            {/* <Earth /> */}
            {/* <MasterCard /> */}
            {/* <DesignCard /> */}
            {/* <PhoneHoverCard /> */}
            {/* <AnotherMasterCard /> */}
            {/* <div className="flex flex-col justify-center items-center md:flex-row gap-4 md:gap-8 p-4 max-w-7xl mx-auto">

            <Card2 />
            <Kard />
            </div> */}
            {/* <Go /> */}
            {/* <Business /> */}
            {/* <Transaction /> */}
            {/* <Wallet /> */}
        <div className="relative bg-black/80 backdrop-blur-sm">
            {/* <BackgroundGradientDemo /> */}
            {/* <Footer/> */}
          </div>
        </div>
      </div>
        </div>
  )
}