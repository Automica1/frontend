// How it works
'use client';
import React, { useState, useEffect } from 'react';
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";
import Image from 'next/image';

// Evervault Card Components
interface EvervaultCardProps {
  className?: string;
  imageSrc: string;
  imageAlt: string;
}

const EvervaultCard: React.FC<EvervaultCardProps> = ({ className, imageSrc, imageAlt }) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    let str = generateRandomString(1500);
    setRandomString(str);
  }, []);

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    const str = generateRandomString(1500);
    setRandomString(str);
  }

  return (
    <div className="p-0.5 bg-transparent aspect-square flex items-center justify-center w-full h-full relative">
      <div
        onMouseMove={onMouseMove}
        className="group/card rounded-3xl w-full relative overflow-hidden bg-transparent flex items-center justify-center h-full"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />
        <div className="relative z-10 flex items-center justify-center">
  <div className="relative h-44 w-44 rounded-full flex items-center justify-center text-white font-bold text-4xl">
    <div className="absolute w-full h-full bg-black/[0.8] blur-sm rounded-full" />
    <div className="relative z-20 w-full h-full flex items-center justify-center">
      <Image 
        src={imageSrc} 
        alt={imageAlt} 
        fill 
        className="object-cover rounded-full"
        style={{
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%'
        }}
      />
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

import type { MotionValue } from 'framer-motion';

interface CardPatternProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  randomString: string;
}

const CardPattern: React.FC<CardPatternProps> = ({ mouseX, mouseY, randomString }) => {
  let maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-700 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
        style={style}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
};

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

const generateRandomString = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Main Component
export default function HowItWorks() {
  const { isAuthenticated, user } = useKindeAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isAuthenticated) {
      router.push("/services");
    } else {
      router.push("/api/auth/login?post_login_redirect_url=/services");
    }
  };
  const steps = [
    {
      id: '01',
      imageSrc: '/images/1.svg',
      imageAlt: 'Upload Document',
      title: 'Upload Your Document',
      description: 'Easily upload scanned or digital documents in any format. Our secure platform supports images, PDFs, and more—whether its a single page or a bulk upload..',
      bgGradient: 'from-purple-500/10 to-purple-900/10'
    },
    {
      id: '02',
      imageSrc: '/images/2.svg',
      imageAlt: 'AI Processing',
      title: 'AI-Powered Processing',
      description: 'Our intelligent system analyzes the document to perform tasks such as data extraction, redaction, pattern detection, or validation—tailored to your specific use case.',
      bgGradient: 'from-blue-500/10 to-purple-700/10'
    },
    {
      id: '03',
      imageSrc: '/images/3.svg',
      imageAlt: 'Get Results',
      title: 'Get Actionable Results',
      description: 'Receive clean, structured results ready for review or integration. You can download outputs, view reports, or connect to your systems via API—all within seconds.',
      bgGradient: 'from-purple-600/10 to-pink-500/10'
    }
  ];

  return (
    <section className=" bg-[#0b0b0d] text-white py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-black"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-3" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-light text-white tracking-tighter leading-tight mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light opacity-80">
            Three simple steps to transform how you handle documents using AI.
From compliance checks to data extraction, the process is fast, secure, and fully automated.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="group relative"
            >
              {/* Step Number Badge */}
              {/* <div className="absolute -top-4 -right-4 z-20">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-purple-800/80 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {step.id}
                </div>
              </div> */}

              {/* Card with Evervault Effect */}
              <div className="border border-white/[0.2] flex flex-col items-start mx-auto p-6 relative h-[35rem] rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm transition-all duration-500 group-hover:border-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
                
                {/* Corner Icons */}
                <Icon className="absolute h-6 w-6 -top-3 -left-3 text-purple-400" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-purple-400" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 text-purple-400" />
                {/* <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-purple-400" /> */}
                
                {/* Evervault Card */}
                <div className="w-full h-64 mb-6">
                  <EvervaultCard 
                    imageSrc={step.imageSrc}
                    imageAlt={step.imageAlt}
                    className="w-full h-full"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-purple-100/90 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300/90 transition-colors duration-300 mb-6">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Hover indicator */}
                  <p className="text-sm border font-light border-white/[0.2] rounded-full text-gray-300 px-3 py-1.5 self-start opacity-70 group-hover:opacity-100 group-hover:border-purple-400/50 transition-all duration-300">
                    Built for Enterprise
                  </p>
                </div>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/60 to-purple-800/60 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Connection Line */}
              {index < steps.length -1  && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-10 h-0.5 bg-gradient-to-r from-purple-500/30 to-transparent transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500/60 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button onClick={handleClick} className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500/90 to-purple-800/90 rounded-lg text-white font-medium text-lg hover:from-purple-600/90 hover:to-purple-900/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
            <p className="mr-3">Get Started Now</p>
            <div className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}