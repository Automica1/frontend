import React from 'react';
import { CheckCircle, Users, Zap, Shield, Globe, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            About Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            We're pioneering the future of AI integration with enterprise-grade APIs 
            that transform how businesses leverage artificial intelligence.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-white">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                To democratize AI technology by providing robust, scalable, and secure APIs 
                that enable businesses of all sizes to harness the power of artificial intelligence 
                without the complexity of building from scratch.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                We believe that AI should be accessible, reliable, and seamlessly integrated 
                into existing workflows, empowering organizations to innovate faster and 
                deliver exceptional value to their customers.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20 flex items-center justify-center">
                <Zap className="w-24 h-24 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-900/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-purple-500/20 bg-black/40">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Security First</h3>
              <p className="text-gray-300">
                Enterprise-grade security with encryption, authentication, and compliance 
                standards that protect your data and maintain privacy.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-purple-500/20 bg-black/40">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Customer-Centric</h3>
              <p className="text-gray-300">
                We prioritize our customers' success with dedicated support, 
                comprehensive documentation, and continuous improvement based on feedback.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-purple-500/20 bg-black/40">
              <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Innovation</h3>
              <p className="text-gray-300">
                Constantly evolving our technology stack and expanding our API offerings 
                to stay ahead of the rapidly changing AI landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Proven Reliability</h3>
                  <p className="text-gray-300">
                    99.9% uptime guarantee with robust infrastructure and failover systems 
                    ensuring your applications run smoothly.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Scalable Architecture</h3>
                  <p className="text-gray-300">
                    From startup to enterprise, our APIs scale with your needs without 
                    compromising performance or increasing complexity.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Expert Support</h3>
                  <p className="text-gray-300">
                    Our team of AI specialists and engineers provide 24/7 support and 
                    guidance for seamless integration and optimization.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Cost-Effective</h3>
                  <p className="text-gray-300">
                    Transparent pricing with no hidden fees, allowing you to budget 
                    effectively while maximizing ROI on AI investments.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Rapid Integration</h3>
                  <p className="text-gray-300">
                    Simple, well-documented APIs that can be integrated in minutes, 
                    not months, accelerating your time to market.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Future-Ready</h3>
                  <p className="text-gray-300">
                    Built with cutting-edge technology and designed to evolve with 
                    emerging AI trends and capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-300">API Calls Daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-300">Enterprise Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of companies already leveraging our AI APIs to drive innovation and growth.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}