'use client';
import React from 'react';
import { Twitter, Linkedin, Github, MessageSquare, Brain } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API Documentation', href: '#api-docs' },
      { name: 'Integrations', href: '#integrations' }
    ],
    Company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' }
    ],
    Resources: [
      { name: 'Help Center', href: '#help' },
      { name: 'Security', href: '#security' },
      { name: 'Status', href: '#status' },
      { name: 'Terms of Service', href: '#terms' }
    ],
    Developers: [
      { name: 'API Reference', href: '#api-reference' },
      { name: 'SDKs', href: '#sdks' },
      { name: 'Webhooks', href: '#webhooks' },
      { name: 'Changelog', href: '#changelog' }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Github, href: '#github', label: 'GitHub' },
    { icon: MessageSquare, href: '#discord', label: 'Discord' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' }
  ];

  return (
    <footer className="bg-[#0b0b0d] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-black"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href='/' className="flex items-center space-x-3 mb-6">
              <Image
                              src="/logo.svg"
                              alt="Automica.ai Logo"
                              className='rounded-md'
                              width={32}
                              height={32}
                              priority
                            />
              <span className="text-2xl font-bold text-white">Automica.ai</span>
            </Link>
            
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              Intelligent AI solutions for document processing and verification.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-center hover:border-purple-500/50 hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h3 className="text-white font-semibold mb-6 text-lg">
                {category}
              </h3>
              <ul className="space-y-4">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-12">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-gray-500 text-sm">
            © 2024 Automica.ai. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-6">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-500 hover:text-purple-400 transition-colors duration-300 text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Accent */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 opacity-60"></div> */}
    </footer>
  );
}