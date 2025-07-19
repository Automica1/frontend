'use client';
import { ArrowRight, Network, Database, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import {LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

// NetworkAnimation component embedded
type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  connections: number[];
};

const NetworkAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 });
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const particleCount = Math.min(Math.floor(window.innerWidth / 15), 100);
      const particles: Particle[] = [];
      
      const colors = ['#0EA5E9', '#8B5CF6', '#33C3F0', '#A78BFA'];
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 2 + 1;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.1,
          connections: [],
        });
      }
      
      particlesRef.current = particles;
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.connections = [];
        
        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      // Connect particles with lines
      connectParticles();
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawParticles);
    };
    
    const connectParticles = () => {
      const maxDistance = Math.min(canvas.width, canvas.height) * 0.15;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Calculate connection strength (more transparent as distance increases)
            const alpha = 1 - (distance / maxDistance);
            
            // Draw line between particles
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Create gradient for line
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, p1.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
            gradient.addColorStop(1, p2.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            // Track connections for each particle
            p1.connections.push(j);
            p2.connections.push(i);
          }
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    // Initialize canvas and start animation
    resizeCanvas();
    drawParticles();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

const SolutionsHero = () => {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };
  
  const subtitleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1
    }
  };
  
  return (
    <section className="bg-black text-white pt-40 pb-20 relative overflow-hidden flex items-center">
      <NetworkAnimation />
      
      {/* Floating icons - hidden on mobile, properly positioned on larger screens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <motion.div 
          className="absolute top-1/4 left-[8%] xl:left-[12%] p-3 rounded-full bg-white/5 backdrop-blur-sm"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        >
          <Network className="text-blue-400/70" size={20} />
        </motion.div>
        
        <motion.div 
          className="absolute top-2/3 right-[8%] xl:right-[12%] p-3 rounded-full bg-white/5 backdrop-blur-sm"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Database className="text-purple-400/70" size={20} />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 left-[15%] xl:left-[20%] p-3 rounded-full bg-white/5 backdrop-blur-sm"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        >
          <Cpu className="text-blue-400/70" size={20} />
        </motion.div>
      </div>
      
      {/* Content - Full width centered layout */}
      <div className="w-full text-center relative z-10 px-4 sm:px-6 md:px-8 lg:px-16">
        <motion.h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 max-w-5xl mx-auto leading-tight"
          variants={titleVariants} 
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <span className="relative inline-block w-full">
  <p className="text-4xl sm:text-3xl lg:text-7xl font-mono text-white tracking-tighter leading-tight max-w-5xl mx-auto text-center">
    Powerful AI APIs <br />
    <span className="sm:text-3xl lg:text-5xl bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
       Built for Real-World Use Cases
    </span>
  </p>
</span>

        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-400 max-w-3xl mx-auto font-light opacity-80"
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: "easeInOut"
          }}
        >
          Enterprise-grade AI solutions to solve complex business demands across all industries
        </motion.p>
        
        {/* Animated arrow down indicator */}
        <motion.div 
          className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ArrowRight className="transform rotate-90 text-white/70" size={24} />
        </motion.div>

      {!isLoading && !isAuthenticated && (

        <div className="text-center mt-10">
                <LoginLink postLoginRedirectURL="/services" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500/90 to-purple-800/90 rounded-lg text-white font-medium text-lg hover:from-purple-600/90 hover:to-purple-900/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <p className="mr-3">Get Started Now</p>
                  <div className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </LoginLink>
              </div>
      )}

      </div>
    </section>
  );
};

export default SolutionsHero;