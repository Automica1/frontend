'use client';

import React from 'react';
import { Mail, MessageCircle, Clock, Star, Zap, Shield, Globe, Code } from 'lucide-react';
import ContactForm from '../components/ContactForm';

const ContactPage: React.FC = () => {
  const whatsappNumber = "+91 7983436983";
  const emailAddress = "sales@automica.ai";

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full px-6 py-2 mb-6 border border-purple-500/30">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Contact Our AI Experts</span>
          </div>
          <h1 className="text-5xl pt-2 md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Let's Build Something Amazing
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your business with cutting-edge AI APIs? 
            Choose your services and let's discuss how we can accelerate your innovation.
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 pt-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-white">Get in Touch</h2>
                <p className="text-gray-300 text-lg mb-8">
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
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <a href={`mailto:${emailAddress}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                      {emailAddress}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/5 to-teal-500/5 hover:from-green-500/10 hover:to-teal-500/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">WhatsApp</h3>
                    <a 
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition-colors"
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
                    <h3 className="text-lg font-semibold text-white">Business Hours</h3>
                    <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-400">24/7 Support for Enterprise</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Fast Response</h3>
                </div>
                <p className="text-gray-300">
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

      {/* Enhanced FAQ Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-900/20 to-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-gray-300">Quick answers to common questions about our AI APIs</p>
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
              <div key={index} className="p-6 rounded-xl border border-gray-700/50 bg-black/40 hover:bg-black/60 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 bg-${faq.color.replace('text-', '')}-500/20 rounded-lg flex items-center justify-center`}>
                    <faq.icon className={`w-4 h-4 ${faq.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                </div>
                <p className="text-gray-300 pl-11">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;