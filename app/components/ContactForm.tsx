'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, ArrowRight, FileCheck, QrCode, Table, Shield, User, Scissors, Pen } from 'lucide-react';

// Services data
const servicesData = {
  'signature-verification': {
    title: 'Signature Verification',
    slug: 'signature-verification',
    icon: FileCheck,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Advanced signature verification with ML algorithms'
  },
  'qr-extract': {
    title: 'QR Extract',
    slug: 'qr-extract',
    icon: QrCode,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Extract QR codes from images with high accuracy'
  },
  'id-crop': {
    title: 'ID Crop',
    slug: 'id-crop',
    icon: Table,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    description: 'Automatically detect and extract tabular data'
  },
  'qr-masking': {
    title: 'QR Masking',
    slug: 'qr-masking',
    icon: Shield,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    description: 'Generate branded QR codes with customization'
  },
  'face-verify': {
    title: 'Face Verify',
    slug: 'face-verify',
    icon: User,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    description: 'Advanced facial recognition with privacy protection'
  },
  'face-cropping': {
    title: 'Face Cropping',
    slug: 'face-cropping',
    icon: Scissors,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    description: 'Smart face detection and cropping with optimization'
  },
  'custom-requirement': {
    title: 'Custom Requirement',
    slug: 'custom-requirement',
    icon: Pen,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Build customized AI solutions to meet your specific business needs'
  },
};

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string[];
}

interface ContactFormProps {
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    inquiryType: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleCheckboxChange = (serviceSlug: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      inquiryType: prev.inquiryType.includes(serviceSlug)
        ? prev.inquiryType.filter((item: string) => item !== serviceSlug)
        : [...prev.inquiryType, serviceSlug]
    }));
    // Clear error when user selects services
    if (error) setError(null);
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          message: '',
          inquiryType: []
        });
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900/60 to-black/60 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-sm ${className}`}>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
            type="submit"
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
        </form>
      )}
    </div>
  );
};

export default ContactForm;