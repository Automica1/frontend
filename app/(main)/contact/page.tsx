'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Mail, MessageCircle, Clock, Star, Zap, Shield, Globe, Code } from 'lucide-react';
import ContactForm from '../components/contact/ContactForm';

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

const ContactPage = () => {
  const whatsappNumber = "+91 7983436983";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const emailAddress = "sales@automica.ai";

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
            <h1 className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight mb-8">
              Let's Build Something <span className="text-purple-400">Amazing</span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl lg:text-2xl text-gray-400 mb-12 font-light leading-relaxed">
              Ready to transform your business with cutting-edge AI APIs?
              Choose your services and let's discuss how we can accelerate your innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      {/* Contact Information & Form */}
      <section className="py-16 pt-4 px-4 relative">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-[90rem] mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Contact Information Card */}
            <div className="relative overflow-hidden bg-white/[0.02] p-8 lg:p-12 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between h-full">
              {/* Background Gradients */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

              <div className="space-y-10">
                <div>
                  <div className="inline-block mb-6">
                    <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                      Contact Us
                    </span>
                    <div className="w-20 h-[1px] bg-gradient-to-r from-purple-500 to-transparent mt-3"></div>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-light text-white tracking-tight leading-tight mb-6">
                    Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Touch</span>
                  </h2>
                  <p className="text-gray-400 text-lg font-light leading-relaxed mb-6">
                    Have questions about our AI APIs? Need technical support?
                    Or want to discuss enterprise solutions? We're here to help.
                  </p>
                </div>

                {/* Contact Methods */}
                <div className="space-y-4">
                  <div className="group flex items-center space-x-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Email Support</h3>
                      <a href={`mailto:${emailAddress}`} className="text-xl text-white hover:text-purple-400 transition-colors font-light">
                        {emailAddress}
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-center space-x-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-green-500/20 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">WhatsApp Chat</h3>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl text-white hover:text-green-400 transition-colors font-light"
                      >
                        {whatsappNumber}
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-center space-x-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/20 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Business Hours</h3>
                      <p className="text-lg text-white font-light">Mon - Fri: 9:00 AM - 6:00 PM</p>
                      <p className="text-sm text-purple-400/80 font-light mt-1">24/7 Support for Enterprise</p>
                    </div>
                  </div>
                </div>

                {/* Response Time - Simplified */}
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-purple-300 font-light">Typical response time: &lt; 30 mins</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm className="h-full" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-8">
              <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
                Common Questions
              </span>
              <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white tracking-tight leading-tight">
              Frequently Asked <span className="text-purple-400">Questions</span>
            </h2>
            <p className="text-gray-400 font-light text-lg leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about our platform, billing, and technical capabilities.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How quickly can I get started?",
                answer: "You can start using our APIs within minutes. Sign up for a free account, get your API key, and begin integrating with our comprehensive documentation. We provide SDKs for all major languages.",
                icon: Zap
              },
              {
                question: "Do you offer enterprise support?",
                answer: "Yes, we provide dedicated enterprise support with SLA guarantees, priority response times (under 15 mins), and dedicated technical account management for large-scale deployments.",
                icon: Shield
              },
              {
                question: "What's your uptime guarantee?",
                answer: "We guarantee 99.99% uptime with robust global infrastructure and automatic failover systems. our status page provides real-time transparency on system performance.",
                icon: Globe
              },
              {
                question: "Can I test the APIs before purchasing?",
                answer: "Absolutely! We offer a generous free tier that includes 1,000 API calls per month. You can explore all features and test integration before committing to a paid plan.",
                icon: Code
              },
              {
                question: "How do you handle data privacy?",
                answer: "Security is our top priority. We are SOC 2 Type II compliant, GDPR ready, and use end-to-end encryption for all data in transit and at rest. We never use customer data to train our public models.",
                icon: Shield
              }
            ].map((faq, index) => {
              const isOpen = hoveredIndex === index + 10; // offset to avoid conflict with top cards
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl transition-all duration-500"
                  onClick={() => setHoveredIndex(isOpen ? null : index + 10)}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${isOpen
                      ? 'border-purple-500/30'
                      : 'border-white/5 hover:border-purple-500/20'
                      }`}
                    style={{
                      background: isOpen ? `
                        radial-gradient(circle at 50% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 70%),
                        rgba(255, 255, 255, 0.03)
                      ` : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <button className="w-full flex items-center justify-between p-6 text-left relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400 group-hover:bg-purple-500/10 group-hover:text-purple-400'
                          }`}>
                          <faq.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-lg font-light transition-colors duration-300 ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                          {faq.question}
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen
                        ? 'bg-purple-500 border-purple-500 rotate-45'
                        : 'border-white/10 group-hover:border-purple-500/30'
                        }`}>
                        <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'bg-white' : 'bg-gray-400 group-hover:bg-purple-400'}`}></div>
                        <div className={`absolute w-0.5 h-4 bg-current transition-all duration-300 ${isOpen ? 'bg-white' : 'bg-gray-400 group-hover:bg-purple-400'}`}></div>
                      </div>
                    </button>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden relative z-10 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="px-6 pb-6 pl-[4.5rem] pt-0">
                        <p className="text-gray-400 font-light leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Divider */}
          <div className="flex justify-center items-center mt-20 space-x-4">
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;