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

  // Pre-fill form data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.given_name && user.family_name
          ? `${user.given_name} ${user.family_name}`
          : user.given_name || user.family_name || '',
        email: user.email || ''
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
        // Reset form but keep user data for next submission
        setFormData(prev => ({
          name: isAuthenticated && user ?
            (user.given_name && user.family_name
              ? `${user.given_name} ${user.family_name}`
              : user.given_name || user.family_name || '') : '',
          email: isAuthenticated && user?.email ? user.email : '',
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
    <div className={`relative overflow-hidden bg-white/[0.02] p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl ${className}`}>
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="mb-8">
        <h2 className="text-3xl font-light text-white mb-2">Send us a Message</h2>
        <p className="text-gray-400 font-light text-sm">Fill out the form below and we'll get back to you shortly.</p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-2xl font-light mb-3 text-white">Message Sent!</h3>
          <p className="text-gray-400 mb-8 font-light max-w-xs mx-auto">
            Thank you for reaching out. We'll be in touch within 2-4 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Send Another Message</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <p className="text-red-400 text-sm font-light">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300 ml-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 font-light"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 font-light"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium text-gray-300 ml-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 font-light"
              placeholder="Your Company Name"
            />
          </div>

          {/* Services Selection - Now Optional */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Select AI Services (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(servicesData).map(([key, service]) => {
                const Icon = service.icon;
                const isSelected = formData.inquiryType.includes(key);

                return (
                  <div
                    key={key}
                    onClick={() => handleCheckboxChange(key)}
                    className={`
                      relative p-3 rounded-xl border cursor-pointer transition-all duration-300 group
                      ${isSelected
                        ? `${service.borderColor} ${service.bgColor}`
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                        ${isSelected ? service.bgColor : 'bg-white/5 group-hover:bg-white/10'}
                      `}>
                        <Icon className={`w-4 h-4 transition-colors duration-300 ${isSelected ? service.color : 'text-gray-400 group-hover:text-gray-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-light text-sm transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                            {service.title}
                          </h3>
                        </div>
                      </div>
                      {isSelected && (
                        <div className={`w-4 h-4 rounded-full ${service.bgColor} flex items-center justify-center`}>
                          <CheckCircle className={`w-3 h-3 ${service.color}`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-300 ml-1">
              Project Details *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 resize-none transition-all duration-300 font-light"
              placeholder="Tell us about your requirements, volume, and timeline..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-purple-500/90 to-purple-800/90 rounded-xl text-white font-medium text-lg hover:from-purple-600/90 hover:to-purple-900/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <span className="mr-2">Send Message</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>

          {formData.inquiryType.length > 0 && (
            <p className="text-center text-xs text-gray-500 font-light">
              We'll include details for {formData.inquiryType.length} selected service{formData.inquiryType.length > 1 ? 's' : ''}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default ContactForm;