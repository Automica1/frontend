import Hero2 from "./components/landing_components/Hero";
import HowItWorks from "./components/landing_components/HowItWorks";
// import LogoMarque from "./components/landing_components/LogoMarque";
// import {TabsDemo} from "./components/landingPage/TabsDemo";
import {Users, Shield, Globe, CheckCircle } from 'lucide-react';
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
    
    {/* Values Section with Glassmorphism */}
      <section className="py-16 px-4 relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4 text-white">Our Values</h2>
            <p className="text-gray-300 font-light">Core principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Security First",
                description: "Enterprise-grade security with encryption, authentication, and compliance standards that protect your data and maintain privacy.",
                color: "text-purple-400"
              },
              {
                icon: Users,
                title: "Customer-Centric",
                description: "We prioritize our customers' success with dedicated support, comprehensive documentation, and continuous improvement based on feedback.",
                color: "text-blue-400"
              },
              {
                icon: Globe,
                title: "Innovation",
                description: "Constantly evolving our technology stack and expanding our API offerings to stay ahead of the rapidly changing AI landscape.",
                color: "text-green-400"
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="relative p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 mx-auto mb-4">
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-light mb-3 text-white">{value.title}</h3>
                  <p className="text-gray-300 font-light leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4 text-white">Why Choose Us</h2>
            <p className="text-gray-300 font-light">What sets us apart in the AI API landscape</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: "Proven Reliability",
                description: "99.9% uptime guarantee with robust infrastructure and failover systems ensuring your applications run smoothly."
              },
              {
                title: "Scalable Architecture", 
                description: "From startup to enterprise, our APIs scale with your needs without compromising performance or increasing complexity."
              },
              {
                title: "Expert Support",
                description: "Our team of AI specialists and engineers provide 24/7 support and guidance for seamless integration and optimization."
              },
              {
                title: "Cost-Effective",
                description: "Transparent pricing with no hidden fees, allowing you to budget effectively while maximizing ROI on AI investments."
              },
              {
                title: "Rapid Integration",
                description: "Simple, well-documented APIs that can be integrated in minutes, not months, accelerating your time to market."
              },
              {
                title: "Future-Ready",
                description: "Built with cutting-edge technology and designed to evolve with emerging AI trends and capabilities."
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-light mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300 font-light leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

          <section className="py-16 px-4 relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "< 1 sec", label: "Average Response Time" },
              { value: "99.9%", label: "Uptime Guarantee" },
              { value: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="relative p-8 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl font-light text-purple-400 mb-2">{stat.value}</div>
                  <div className="text-gray-300 font-light">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    {/* <TabsDemo /> */}
    <FeaturesSectionDemo/>
    </>
  );
}
