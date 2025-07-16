'use client'
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, Users, Zap, Shield, Globe, Award, Star } from 'lucide-react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";
// Extend Window interface to include VANTA
declare global {
  interface Window {
    VANTA: any;
  }
}

// TopologyBackground Component
function TopologyBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    const p5Script = document.createElement('script');
    p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js';
    p5Script.async = true;

    const vantaScript = document.createElement('script');
    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js';
    vantaScript.async = true;

    p5Script.onload = () => {
      document.body.appendChild(vantaScript);
    };

    vantaScript.onload = () => {
      if (window.VANTA && !vantaEffect) {
        const effect = window.VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x6b4e96,
          backgroundColor: 0x110022
        });
        setVantaEffect(effect);
      }
    };

    document.body.appendChild(p5Script);

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="w-full h-full" />;
}

export default function About() {
  const { isAuthenticated, user } = useKindeAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isAuthenticated) {
      router.push("/services");
    } else {
      router.push("/api/auth/login?post_login_redirect_url=/services");
    }
  };
  return (
    <div className="min-h-screen bg-black text-white pt-8 font-light">
      {/* Hero Section with Topology Background */}
      <section className="relative h-[70vh] px-4 overflow-hidden">
        {/* Topology Background */}
        <div className="absolute inset-0 z-0">
          <TopologyBackground />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full px-6 py-2 mb-6 border border-purple-500/30 backdrop-blur-sm">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-light">About Our AI Platform</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-tight mb-8 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="max-w-3xl mx-auto text-xl lg:text-2xl text-gray-300 mb-12 font-light leading-relaxed opacity-90">
              We're pioneering the future of AI integration with enterprise-grade APIs 
              that transform how businesses leverage artificial intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 pt-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light mb-6 text-white">Our Mission</h2>
              <p className="text-gray-300 text-xl font-light leading-relaxed mb-6 opacity-90">
                To democratize AI technology by providing robust, scalable, and secure APIs 
                that enable businesses of all sizes to harness the power of artificial intelligence 
                without the complexity of building from scratch.
              </p>
              <p className="text-gray-300 text-xl font-light leading-relaxed opacity-90">
                We believe that AI should be accessible, reliable, and seamlessly integrated 
                into existing workflows, empowering organizations to innovate faster and 
                deliver exceptional value to their customers.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20 flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-24 h-24 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Why Choose Us Section */}
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

      {/* Stats Section with Glassmorphism */}
      <section className="py-16 px-4 relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "API Calls Daily" },
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

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-6 text-white">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8 font-light opacity-90">
            Join thousands of companies already leveraging our AI APIs to drive innovation and growth.
          </p>
          <button onClick={handleClick} className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500/90 to-purple-800/90 rounded-lg text-white font-medium text-lg hover:from-purple-600/90 hover:to-purple-900/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            <span className="mr-3">Get Started Now</span>
            <div className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}