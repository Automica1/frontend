// import Image from "next/image";
// import ComingSoon from "./components/CommingSoon";
// import ContactUs from "./components/ContactUs";
import FeaturedSolutions from "./components/landingPage/FeaturedSolution";
import Footer from "./components/landingPage/Footer";
// import Hero from "./components/landingPage/Hero";
import Hero2 from "./components/landingPage/Hero2";
import HowItWorks from "./components/landingPage/HowItWorks";
// import Hero3 from "./components/Hero3";
import Navbar from "./components/landingPage/Navbar";
import WhatWeDo from "./components/landingPage/WhatWeDo";
// import Test from "./components/Test"
import LogoMarque from "./components/landingPage/LogoMarque";
import {TabsDemo} from "./components/landingPage/TabsDemo";
import StickyScrollRevealDemo from "./components/landingPage/StickyScrollRevealDemo";
import { SpotlightNewDemo } from "./components/landingPage/SpotlightNewDemo";
import { FeaturesSectionDemo } from "./components/landingPage/FeatureSectionDemo";

export default function Home() {
  return (
    <>
    <div className="pb-18 bg-[#0b0b0d]">

    {/* <Navbar/> */}
    </div>
    {/* <Test/> */}
    {/* <Hero /> */}
    <Hero2 />
    <LogoMarque />
    {/* <div className="px-40 bg-[#101312]"> */}
    <HowItWorks/>
    <SpotlightNewDemo />
    {/* <WhatWeDo /> */}
    <FeaturedSolutions />
    {/* <StickyScrollRevealDemo /> */}
    <FeaturesSectionDemo/>
    {/* <TabsDemo /> */}
    {/* <ComingSoon/> */}
    {/* </div> */}
    {/* <ContactUs/> */}
    {/* <Footer/> */}
    </>
  );
}

// bg-amber-500

// #0f0f0f
// #0b0b0d