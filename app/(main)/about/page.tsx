'use client'
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, Users, Zap, Shield, Globe, Award, Star, Clock, Headphones, Rocket, Brain, Cpu, Code, Network, Share2 } from 'lucide-react';
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    {
      icon: Clock,
      value: "< 3 sec",
      label: "Average Response Time",
      description: "Lightning-fast API responses"
    },
    {
      icon: Shield,
      value: "99.9%",
      label: "Uptime Guarantee",
      description: "Enterprise-grade reliability"
    },
    {
      icon: Headphones,
      value: "24/7",
      label: "Support Available",
      description: "Round-the-clock assistance"
    },
  ];

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
        <div className="absolute bg-[#110022] inset-0 z-0">
          <TopologyBackground />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto text-center">
            {/* <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full px-6 py-2 mb-6 border border-purple-500/30 backdrop-blur-sm">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">About Our AI Platform</span>
            </div> */}
            <h1 className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight mb-8">
              About <span className="text-purple-400">Us</span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl lg:text-2xl text-gray-400 mb-12 font-light leading-relaxed">
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
              <h2 className="text-4xl lg:text-6xl font-light text-white tracking-tight leading-tight mb-6">Our Mission</h2>
              <p className="text-gray-400 text-lg lg:text-xl font-light leading-relaxed mb-6">
                To democratize AI technology by providing robust, scalable, and secure APIs
                that enable businesses of all sizes to harness the power of artificial intelligence
                without the complexity of building from scratch.
              </p>
              <p className="text-gray-400 text-lg lg:text-xl font-light leading-relaxed">
                We believe that AI should be accessible, reliable, and seamlessly integrated
                into existing workflows, empowering organizations to innovate faster and
                deliver exceptional value to their customers.
              </p>
            </div>
            <div className="relative h-[500px] w-full flex items-center justify-center perspective-1000">
              {/* Background Glows */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>

              {/* Connecting Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full text-purple-500/30 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="50%" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="animate-spin-slow opacity-30" style={{ transformOrigin: 'center' }} />
                <circle cx="50%" cy="50%" r="100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-reverse-slow opacity-50" style={{ transformOrigin: 'center' }} />
                {/* Lines from Center to Satellites */}
                <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
                <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
                <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />
              </svg>

              {/* Central Core Node */}
              <div className="relative z-20 w-32 h-32 bg-black/40 backdrop-blur-md rounded-full border border-purple-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-float">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 animate-pulse"></div>
                <Brain className="w-16 h-16 text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                <div className="absolute -bottom-10 text-purple-300 text-sm font-medium tracking-widest uppercase">Automica</div>
              </div>

              {/* Orbiting Satellite Nodes */}

              {/* Node 1: Global/Web */}
              <div className="absolute top-[25%] left-[20%] z-20 group animate-float-delayed-1">
                <div className="relative w-20 h-20 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center shadow-xl group-hover:border-pink-500/50 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-500">
                  <Globe className="w-8 h-8 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Web</span>
                </div>
              </div>

              {/* Node 2: API/Code */}
              <div className="absolute top-[25%] right-[20%] z-20 group animate-float-delayed-2">
                <div className="relative w-20 h-20 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center shadow-xl group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                  <Code className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">API</span>
                </div>
              </div>

              {/* Node 3: Server/Database */}
              <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-20 group animate-float-delayed-3">
                <div className="relative w-20 h-20 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700/50 flex flex-col items-center justify-center shadow-xl group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-500">
                  <Cpu className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">System</span>
                </div>
              </div>

              {/* Floating Particles */}
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-75 animation-delay-500"></div>
              <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-75"></div>

            </div>
          </div>
        </div>
      </section>




      {/* Stats Section with Glassmorphism */}
      <section className="py-16 px-4 relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`group relative transform transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`relative h-full p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 group-hover:transform group-hover:scale-105 overflow-hidden border ${hoveredIndex === index
                    ? 'bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border-purple-500/30 shadow-2xl shadow-purple-500/20'
                    : 'bg-white/[0.02] border-white/10'
                    }`}>

                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="relative z-10 text-center">
                      <div className="mb-6 flex justify-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${hoveredIndex === index
                          ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/25'
                          : 'bg-white/5 border border-white/10'
                          }`}>
                          <IconComponent className={`w-8 h-8 transition-all duration-500 ${hoveredIndex === index
                            ? 'text-white'
                            : 'text-purple-400'
                            }`} />
                        </div>
                      </div>

                      <div className="text-4xl lg:text-5xl font-light text-white mb-3 tracking-tight">
                        {stat.value}
                      </div>

                      <div className="text-lg font-light text-gray-300 mb-2 tracking-tight">
                        {stat.label}
                      </div>

                      <div className="text-sm font-light text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                        {stat.description}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-full"></div>

                    <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  </div>

                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white font-medium text-xs transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-lg shadow-purple-500/30">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto relative">
          <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-purple-500/20"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)
              `,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>

            <div className="relative z-10 py-20 px-8 text-center">
              <div className="w-full max-w-4xl mx-auto mb-12 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">
                  <iframe
                    src="https://player.cloudinary.com/embed/?cloud_name=dcycu6mqh&public_id=automica_aboaut_otje9f&profile=cld-default"
                    className="w-full h-full border-none"
                    title="Automica Platform Demo"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              {/* <div className="inline-block mb-8">
                <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                  Get Started Today
                </span>
                <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
              </div> */}

              <h2 className="text-4xl lg:text-6xl font-light text-white tracking-tight leading-tight mb-6">
                Ready to Transform Your <span className="text-purple-400">Business?</span>
              </h2>

              <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                Join thousands of companies already leveraging our{" "}
                <span className="text-purple-400 font-medium">AI APIs</span> to drive{" "}
                <span className="text-white font-medium">innovation and growth</span>
              </p>

              <button
                onClick={handleClick}
                className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl text-white font-light text-lg hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105"
              >
                <span className="mr-3">Get Started Now</span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </button>

              <div className="flex justify-center items-center mt-12 space-x-4">
                <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
