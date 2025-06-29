'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      details: "hello@automica.ai"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      details: "+1 (555) 123-4567"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location",
      details: "San Francisco, CA"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', company: '', message: '' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team to discuss your project requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="border border-gray-200 rounded-lg p-8">
            {!isSubmitted ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-black mb-6">Send Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-black text-white py-3 px-6 rounded font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-6 h-6 text-black" />
                </div>
                <h4 className="text-xl font-semibold text-black mb-3">
                  Message Sent!
                </h4>
                <p className="text-gray-600 mb-6">
                  We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-black font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-black mb-6">
                Get in Touch
              </h3>
              <p className="text-gray-600 mb-8">
                Ready to start your project? We're here to help bring your ideas to life.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded p-4 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-black">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-black">
                        {info.title}
                      </h4>
                      <p className="text-gray-600">
                        {info.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="border border-gray-200 rounded p-6">
              <h4 className="font-semibold text-black mb-3">
                Business Hours
              </h4>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Average response time: <span className="font-medium text-black">2-4 hours</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;