'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, ArrowRight, FileCheck, QrCode, Table, Shield, User, Scissors, Pen } from 'lucide-react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

// Services data
const servicesData = {
  'signature-verification': {
    title: 'Signature Verification',
    slug: 'signature-verification',
    icon: FileCheck,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
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
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Automatically detect and extract tabular data'
  },
  'qr-masking': {
    title: 'QR Masking',
    slug: 'qr-masking',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Generate branded QR codes with customization'
  },
  'face-verify': {
    title: 'Face Verify',
    slug: 'face-verify',
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Advanced facial recognition with privacy protection'
  },
  'face-cropping': {
    title: 'Face Cropping',
    slug: 'face-cropping',
    icon: Scissors,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Smart face detection and cropping with optimization'
  },
  'custom-requirement': {
    title: 'Custom Requirement',
    slug: 'custom-requirement',
    icon: Pen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
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
  const { isAuthenticated, user } = useKindeAuth();
  
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

  // Pre-fill form data when user is authenticated (but keep fields empty for editing)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Don't pre-fill, just set empty values to let placeholder show
      setFormData(prev => ({
        ...prev,
        name: '',
        email: ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleCheckboxChange = (serviceSlug: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      inquiryType: prev.inquiryType.includes(serviceSlug)
        ? prev.inquiryType.filter((item: string) => item !== serviceSlug)
        : [...prev.inquiryType, serviceSlug]
    }));
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
        body: JSON.stringify({
          ...formData,
          // Include user ID if authenticated for backend reference
          userId: isAuthenticated ? user?.id : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        // Reset only the fields that should be cleared (keep name/email empty for next time)
        setFormData(prev => ({
          ...prev,
          name: '',
          email: '',
          company: '',
          message: '',
          inquiryType: []
        }));
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
    <div className={`bg-[#3f3f3f] p-6 rounded-2xl border border-[#161616] backdrop-blur-sm font-light ${className}`}>
      <h2 className="text-2xl font-light mb-6 text-white">Send us a Message</h2>
      
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-light mb-2 text-white">Message Sent Successfully!</h3>
          <p className="text-gray-300 mb-4 font-light">
            Thank you for reaching out. We'll get back to you within 2-4 hours.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors font-light"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Send Another Message</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm font-light">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-light text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2.5 bg-[#161616] border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 font-light"
                placeholder={isAuthenticated && user ? 
                  (user.given_name && user.family_name 
                    ? `${user.given_name} ${user.family_name}` 
                    : user.given_name || user.family_name || "Your Name"
                  ) : "John Doe"
                }
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-light text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2.5 bg-[#161616] border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 font-light"
                placeholder={isAuthenticated && user?.email ? user.email : "john@company.com"}
              />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-light text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 bg-[#161616] border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 font-light"
              placeholder="Your Company Name"
            />
          </div>

          {/* Services Selection - Now Optional */}
          <div>
            <label className="block text-sm font-light text-gray-300 mb-3">
              Select AI Services You're Interested In (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(servicesData).map(([key, service]) => {
                const Icon = service.icon;
                const isSelected = formData.inquiryType.includes(key);
                
                return (
                  <div
                    key={key}
                    onClick={() => handleCheckboxChange(key)}
                    className={`
                      relative p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? `${service.borderColor} ${service.bgColor}` 
                        : 'border-gray-600 bg-[#161616] hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${isSelected ? service.bgColor : 'bg-gray-700'}
                      `}>
                        <Icon className={`w-4 h-4 ${isSelected ? service.color : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-light text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {service.title}
                          </h3>
                          {isSelected && (
                            <CheckCircle className={`w-3 h-3 ${service.color}`} />
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(key)}
                      className="absolute top-2 right-2 w-3 h-3 opacity-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-light text-gray-300 mb-2">
              Tell us about your project *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2.5 bg-[#161616] border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 resize-none transition-all duration-200 font-light"
              placeholder="Describe your requirements, expected volume, timeline, and any specific questions..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-purple-500/90 to-purple-800/90 rounded-lg text-white font-medium text-lg hover:from-purple-600/90 hover:to-purple-900/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                <span>Send Message</span>
              </>
            )}
          </button>
          
          {formData.inquiryType.length > 0 && (
            <p className="text-center text-xs text-gray-400 font-light">
              Selected {formData.inquiryType.length} service{formData.inquiryType.length > 1 ? 's' : ''}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default ContactForm;