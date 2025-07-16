// components/services/CTASection.tsx
'use client'
import React from 'react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <div className="text-center mt-20">
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-3xl p-8 border border-purple-500/20">
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Ready to Get Started?
        </h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of developers already using our APIs to build amazing applications.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
            View Documentation
          </button> */}
                    <Link href={'/contact'} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
            Contact Sales
          </Link>
          {/* <button className="border border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
            Contact Sales
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CTASection;