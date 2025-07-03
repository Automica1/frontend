'use client';
import React, { useEffect, useRef } from 'react';

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

export default NetworkAnimation;
