'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Mail, MessageCircle, Clock, Star, Zap, Shield, Globe, Code } from 'lucide-react';
import ContactForm from '../components/ContactForm';

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
  const emailAddress = "sales@automica.ai";

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
              <span className="text-sm text-purple-300 font-light">Contact Our AI Experts</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-tight mb-8 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Let's Build Something Amazing
            </h1>
            <p className="max-w-3xl mx-auto text-xl lg:text-2xl text-gray-300 mb-12 font-light leading-relaxed opacity-90">
              Ready to transform your business with cutting-edge AI APIs? 
              Choose your services and let's discuss how we can accelerate your innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 pt-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-light mb-6 text-white">Get in Touch</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light opacity-80">
                  Have questions about our AI APIs? Need technical support? 
                  Or want to discuss enterprise solutions? We're here to help.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-light text-white">Email</h3>
                    <a href={`mailto:${emailAddress}`} className="text-purple-400 hover:text-purple-300 transition-colors font-light">
                      {emailAddress}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/5 to-teal-500/5 hover:from-green-500/10 hover:to-teal-500/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-light text-white">WhatsApp</h3>
                    <a 
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition-colors font-light"
                    >
                      {whatsappNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-light text-white">Business Hours</h3>
                    <p className="text-gray-300 font-light">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-400 font-light">24/7 Support for Enterprise</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-light text-white">Fast Response</h3>
                </div>
                <p className="text-gray-300 font-light">
                  We typically respond within 30 mins during business hours. 
                  Enterprise clients get priority 24/7 support.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Glassmorphism FAQ Section */}
      <section className="py-16 px-4 relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-gray-300 font-light">Quick answers to common questions about our AI APIs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: "How quickly can I get started?",
                answer: "You can start using our APIs within minutes. Sign up for a free account, get your API key, and begin integrating with our comprehensive documentation.",
                icon: Zap,
                color: "text-yellow-400"
              },
              {
                question: "Do you offer enterprise support?",
                answer: "Yes, we provide dedicated enterprise support with SLA guarantees, priority response times, and dedicated account management.",
                icon: Shield,
                color: "text-blue-400"
              },
              {
                question: "What's your uptime guarantee?",
                answer: "We guarantee 99.9% uptime with robust infrastructure and automatic failover systems to ensure your applications run smoothly.",
                icon: Globe,
                color: "text-green-400"
              },
              {
                question: "Can I test the APIs before purchasing?",
                answer: "Absolutely! We offer free tier access for testing and evaluation. You can explore all features with generous usage limits.",
                icon: Code,
                color: "text-purple-400"
              }
            ].map((faq, index) => (
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
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <faq.icon className={`w-4 h-4 ${faq.color}`} />
                    </div>
                    <h3 className="text-lg font-light text-white">{faq.question}</h3>
                  </div>
                  <p className="text-gray-300 font-light pl-11 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;