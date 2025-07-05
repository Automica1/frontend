'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Table, QrCode, User, Scissors, Code, Zap, Shield, Globe, FileCheck, Star, ArrowRight } from 'lucide-react';

// Services data with enhanced styling
const servicesData = {
  'signature-verification': {
    title: 'Signature Verification',
    slug: 'signature-verification',
    tagline: 'AI-powered signature authentication',
    icon: FileCheck,
    gradient: 'from-purple-500 to-blue-500',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Advanced signature verification with ML algorithms'
  },
  'qr-extract': {
    title: 'QR Extract',
    slug: 'qr-extract',
    tagline: 'Advanced QR code detection and extraction',
    icon: QrCode,
    gradient: 'from-blue-500 to-cyan-500',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Extract QR codes from images with high accuracy'
  },
  'id-crop': {
    title: 'ID Crop',
    slug: 'id-crop',
    tagline: 'Intelligent document processing',
    icon: Table,
    gradient: 'from-cyan-500 to-teal-500',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    description: 'Automatically detect and extract tabular data'
  },
  'qr-masking': {
    title: 'QR Masking',
    slug: 'qr-masking',
    tagline: 'Create branded QR codes',
    icon: Shield,
    gradient: 'from-teal-500 to-green-500',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    description: 'Generate branded QR codes with customization'
  },
  'face-verify': {
    title: 'Face Verify',
    slug: 'face-verify',
    tagline: 'Secure facial recognition',
    icon: User,
    gradient: 'from-green-500 to-yellow-500',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    description: 'Advanced facial recognition with privacy protection'
  },
  'face-cropping': {
    title: 'Face Cropping',
    slug: 'face-cropping',
    tagline: 'Intelligent face detection',
    icon: Scissors,
    gradient: 'from-yellow-500 to-orange-500',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    description: 'Smart face detection and cropping with optimization'
  }
};

export default function Contact() {
  interface FormData {
    name: string;
    email: string;
    company: string;
    message: string;
    inquiryType: string[];
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    inquiryType: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  interface ServiceData {
    title: string;
    slug: string;
    tagline: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }

  interface ServicesData {
    [key: string]: ServiceData;
  }

  interface FormData {
    name: string;
    email: string;
    company: string;
    message: string;
    inquiryType: string[];
  }

  const handleCheckboxChange = (serviceSlug: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      inquiryType: prev.inquiryType.includes(serviceSlug)
        ? prev.inquiryType.filter((item: string) => item !== serviceSlug)
        : [...prev.inquiryType, serviceSlug]
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        inquiryType: []
      });
    }, 2000);
  };

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

      {/* Services Selection & Form */}
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

            {/* Enhanced Contact Form */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-white">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Message Sent Successfully!</h3>
                  <p className="text-gray-300 mb-6">
                    Thank you for reaching out. We'll get back to you within 2-4 hours.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="Your Company Name"
                    />
                  </div>

                  {/* Enhanced Services Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Select AI Services You're Interested In *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(servicesData).map(([key, service]) => {
                        const Icon = service.icon;
                        const isSelected = formData.inquiryType.includes(key);
                        
                        return (
                          <div
                            key={key}
                            onClick={() => handleCheckboxChange(key)}
                            className={`
                              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                              ${isSelected 
                                ? `${service.borderColor} ${service.bgColor} shadow-lg shadow-${service.color.replace('text-', '')}/20` 
                                : 'border-gray-600 bg-black/40 hover:border-gray-500'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`
                                w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
                                ${isSelected ? service.bgColor : 'bg-gray-700'}
                              `}>
                                <Icon className={`w-6 h-6 ${isSelected ? service.color : 'text-gray-400'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                    {service.title}
                                  </h3>
                                  {isSelected && (
                                    <CheckCircle className={`w-4 h-4 ${service.color}`} />
                                  )}
                                </div>
                                <p className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>
                                  {service.description}
                                </p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCheckboxChange(key)}
                              className="absolute top-4 right-4 w-4 h-4 opacity-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {formData.inquiryType.length === 0 && (
                      <p className="text-red-400 text-sm mt-2">Please select at least one service</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Tell us about your project *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 resize-none transition-all duration-200"
                      placeholder="Describe your requirements, expected volume, timeline, and any specific questions..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || formData.inquiryType.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  
                  {formData.inquiryType.length > 0 && (
                    <p className="text-center text-sm text-gray-400">
                      Selected {formData.inquiryType.length} service{formData.inquiryType.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
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
}