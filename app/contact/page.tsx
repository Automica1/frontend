'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 2000);
  };

  const whatsappNumber = "+1234567890"; // Replace with your actual WhatsApp number
  const emailAddress = "contact@yourdomain.com"; // Replace with your actual email

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Ready to transform your business with AI? Get in touch with our team 
            and discover how our APIs can accelerate your innovation.
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 px-4">
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
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-lg border border-purple-500/20 bg-black/40">
                  <Mail className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <a href={`mailto:${emailAddress}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                      {emailAddress}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg border border-purple-500/20 bg-black/40">
                  <MessageCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
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

                <div className="flex items-center space-x-4 p-4 rounded-lg border border-purple-500/20 bg-black/40">
                  <Clock className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Business Hours</h3>
                    <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM (EST)</p>
                    <p className="text-gray-300">24/7 Support for Enterprise Clients</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg border border-purple-500/20 bg-black/40">
                  <MapPin className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Location</h3>
                    <p className="text-gray-300">San Francisco, CA</p>
                    <p className="text-gray-300">Serving clients globally</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 rounded-lg bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20">
                <h3 className="text-lg font-semibold mb-2 text-white">Response Time</h3>
                <p className="text-gray-300">
                  We typically respond within 2-4 hours during business hours. 
                  For urgent technical issues, our enterprise clients have access to 24/7 support.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-900/40 p-8 rounded-lg border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6 text-white">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Message Sent Successfully!</h3>
                  <p className="text-gray-300 mb-6">
                    Thank you for reaching out. We'll get back to you within 2-4 hours.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400"
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
                        className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400"
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
                      className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-300 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="enterprise">Enterprise Solutions</option>
                      <option value="pricing">Pricing & Plans</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-black/60 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 resize-none"
                      placeholder="Tell us more about your requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-purple-500/20 bg-black/40">
              <h3 className="text-lg font-semibold mb-2 text-white">How quickly can I get started?</h3>
              <p className="text-gray-300">
                You can start using our APIs within minutes. Sign up for a free account, 
                get your API key, and begin integrating with our comprehensive documentation.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-purple-500/20 bg-black/40">
              <h3 className="text-lg font-semibold mb-2 text-white">Do you offer enterprise support?</h3>
              <p className="text-gray-300">
                Yes, we provide dedicated enterprise support with SLA guarantees, 
                priority response times, and dedicated account management.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-purple-500/20 bg-black/40">
              <h3 className="text-lg font-semibold mb-2 text-white">What's your uptime guarantee?</h3>
              <p className="text-gray-300">
                We guarantee 99.9% uptime with robust infrastructure and automatic 
                failover systems to ensure your applications run smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}