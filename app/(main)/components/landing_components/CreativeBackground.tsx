"use client";
import React from 'react';

const CreativeBackground = () => {
  const [stars, setStars] = React.useState<Array<{ id: number, left: number, top: number, size: number, opacity: number, animationDelay: number }>>([]);

  React.useEffect(() => {
    const generateStars = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        animationDelay: Math.random() * 4
      }));
    };

    setStars(generateStars(200));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Simple white star dots */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: '3s'
          }}
        />
      ))}

      {/* Moving gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-float-reverse"></div>
      <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-purple-400/8 rounded-full blur-3xl animate-float-delayed"></div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { 
            transform: translate(0, 0);
          }
          25% { 
            transform: translate(30px, -30px);
          }
          50% { 
            transform: translate(-20px, 20px);
          }
          75% { 
            transform: translate(-30px, -20px);
          }
        }
        
        @keyframes float-reverse {
          0%, 100% { 
            transform: translate(0, 0);
          }
          25% { 
            transform: translate(-40px, 30px);
          }
          50% { 
            transform: translate(20px, -25px);
          }
          75% { 
            transform: translate(35px, 25px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translate(0, 0);
          }
          33% { 
            transform: translate(25px, -40px);
          }
          66% { 
            transform: translate(-30px, 15px);
          }
        }
        
        .animate-float-slow {
          animation: float-slow 25s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 30s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 35s ease-in-out infinite 5s;
        }
      `}</style>
    </div>
  );
};

export default CreativeBackground;