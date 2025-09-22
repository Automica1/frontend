import Hero from "./components/landing_components/Hero";
import HowItWorks from "./components/landing_components/HowItWorks";
// import LogoMarque from "./components/landing_components/LogoMarque";
import { SpotlightNewDemo } from "./components/landing_components/SpotlightNewDemo";
import { FeaturesSectionDemo } from "./components/landing_components/FeatureSectionDemo";
import ValuesSection from "./components/landing_components/ValuesSection";
import StatsSection from "./components/landing_components/StatsSection";
import WhyChooseUs from "./components/landing_components/WhyChooseUs";
import CreativeBackground from "./components/landing_components/CreativeBackground";

export default function Home() {
  return (
    <>
    <div className="pb-18 bg-[#0b0b0d]">
    </div>
    <Hero />
    {/* <LogoMarque /> */}
    <HowItWorks/>
    <SpotlightNewDemo />
     {/* <div className="relative min-h-screen overflow-hidden"> */}
      {/* <CreativeBackground /> */}
      {/* <div className="relative z-10"> */}
        <ValuesSection />
        <WhyChooseUs />
        <StatsSection />
      {/* </div> */}
    {/* // </div> */}
    
    {/* <FeaturesSectionDemo/> */}
    </>
  );
}