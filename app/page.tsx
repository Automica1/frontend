import Hero2 from "./components/landing_components/Hero";
import HowItWorks from "./components/landing_components/HowItWorks";
// import LogoMarque from "./components/landing_components/LogoMarque";
// import {TabsDemo} from "./components/landingPage/TabsDemo";
import { SpotlightNewDemo } from "./components/landing_components/SpotlightNewDemo";
import { FeaturesSectionDemo } from "./components/landing_components/FeatureSectionDemo";

export default function Home() {
  return (
    <>
    <div className="pb-18 bg-[#0b0b0d]">
    </div>
    <Hero2 />
    {/* <LogoMarque /> */}
    <HowItWorks/>
    <SpotlightNewDemo />
    {/* <TabsDemo /> */}
    <FeaturesSectionDemo/>
    </>
  );
}
