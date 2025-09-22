import React from 'react';

const AtomicHeroSkeleton: React.FC = () => {
  return (
    <div className="bg-[#0b0b0d] text-white relative overflow-hidden min-h-screen">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Hero Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-screen">
        
        {/* Left Content Section */}
        <div className="max-w-4xl">
          {/* Main Title Skeleton */}
          <div className="mb-4">
            <div className="h-16 lg:h-20 w-full bg-gradient-to-r from-gray-800/30 via-purple-500/10 to-gray-800/30 bg-[length:200%_100%] animate-shimmer rounded-xl mb-4"></div>
            <div className="h-16 lg:h-20 w-[90%] bg-gradient-to-r from-gray-800/30 via-purple-500/10 to-gray-800/30 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
          </div>
          
         
          {/* Description Lines */}
          <div className="mb-12 space-y-4">
            <div className="h-6 lg:h-7 w-[95%] bg-gradient-to-r from-gray-800/30 via-purple-500/10 to-gray-800/30 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
            <div className="h-6 lg:h-7 w-[88%] bg-gradient-to-r from-gray-800/30 via-purple-500/10 to-gray-800/30 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
            <div className="h-6 lg:h-7 w-[70%] bg-gradient-to-r from-gray-800/30 via-purple-500/10 to-gray-800/30 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
          </div>
          
          {/* Button Skeleton */}
          <div className="h-14 lg:h-16 w-48 bg-gradient-to-r from-purple-600/20 via-purple-500/30 to-purple-600/20 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
        </div>
        
       
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        
        @keyframes nucleus-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .animate-nucleus-pulse {
          animation: nucleus-pulse 3s ease-in-out infinite;
        }
        
        @keyframes nucleus-glow {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        
        .animate-nucleus-glow {
          animation: nucleus-glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes ring-rotate-1 {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .animate-ring-rotate-1 {
          animation: ring-rotate-1 12s linear infinite;
        }
        
        @keyframes ring-rotate-2 {
          0% { transform: translate(-50%, -50%) rotateX(60deg) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(60deg) rotate(360deg); }
        }
        
        .animate-ring-rotate-2 {
          animation: ring-rotate-2 15s linear infinite reverse;
        }
        
        @keyframes ring-rotate-3 {
          0% { transform: translate(-50%, -50%) rotateY(45deg) rotateX(30deg) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotateY(45deg) rotateX(30deg) rotate(360deg); }
        }
        
        .animate-ring-rotate-3 {
          animation: ring-rotate-3 18s linear infinite;
        }
        
        @keyframes electron-orbit-1 {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(90px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        
        .animate-electron-orbit-1 {
          animation: electron-orbit-1 6s linear infinite;
        }
        
        .animate-electron-orbit-1-delayed {
          animation: electron-orbit-1 6s linear infinite;
          animation-delay: -3s;
        }
        
        @keyframes electron-orbit-2 {
          0% { transform: translate(-50%, -50%) rotateX(60deg) rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(60deg) rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        
        .animate-electron-orbit-2 {
          animation: electron-orbit-2 7s linear infinite;
        }
        
        .animate-electron-orbit-2-delayed {
          animation: electron-orbit-2 7s linear infinite;
          animation-delay: -3.5s;
        }
        
        @keyframes particle-float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        
        .animate-particle-float-1 { animation: particle-float 4s linear infinite; }
        .animate-particle-float-2 { animation: particle-float 6s linear infinite; }
        .animate-particle-float-3 { animation: particle-float 4s linear infinite; }
        .animate-particle-float-4 { animation: particle-float 6s linear infinite; }
        .animate-particle-float-5 { animation: particle-float 4s linear infinite; }
        .animate-particle-float-6 { animation: particle-float 6s linear infinite; }
        
        .shadow-purple-glow {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, currentColor 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default AtomicHeroSkeleton;