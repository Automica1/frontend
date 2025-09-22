// Demo.tsx 
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "../ui/canvas-reveal-effect";
import { getPopularSolutions, type Solution } from "../../lib/solutions";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";

export function CanvasRevealEffectDemo() {
  const popularSolutions: Solution[] = getPopularSolutions();

  return (
    <div className="py-0 bg-black">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
          {popularSolutions.map((solution, index) => (
            <SolutionCard 
              key={solution.slug}
              solution={solution}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const SolutionCard = ({ 
  solution, 
  index 
}: { 
  solution: Solution;
  index: number;
}) => {
  const [hovered, setHovered] = React.useState(false);
  const { isAuthenticated, user } = useKindeAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isAuthenticated) {
      router.push(`/services/${solution.slug}`);
    } else {
      router.push("/api/auth/login?post_login_redirect_url=/services");
    }
  };
  
  // Different gradient colors for each card
  const gradientColors = [
    [[168, 85, 247], [147, 51, 234]], // Purple
    [[59, 130, 246], [37, 99, 235]],  // Blue
    [[34, 197, 94], [22, 163, 74]]    // Green
  ];

  const IconComponent = solution.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-gray-700/50 group/canvas-card flex flex-col max-w-sm w-full mx-auto relative h-[30rem] overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/30"
    >
      {/* Popular Badge */}
      <div className="z-50 absolute top-0 left-0 overflow-hidden w-28 h-28 pointer-events-none">
        <div className="absolute top-3 -left-7 w-36 h-7 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 transform -rotate-45 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-semibold uppercase tracking-wider">
            Popular
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-600/40">
        <div className="w-2 h-2 bg-green-400 rounded-full" />
        <span className="text-white text-xs font-medium">Ready</span>
      </div>

      {/* Hover Animation */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={gradientColors[index % gradientColors.length]}
              dotSize={2}
            />
            <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content - Fixed Layout */}
      <div className="relative z-20 flex flex-col h-full">
        
        {/* Image Section */}
        <div className="flex items-center justify-center p-8 pt-12 pb-4">
          <div className="relative w-full max-w-[180px]">
            <img 
              src={solution.imageSrc || solution.heroImage}
              alt={solution.title}
              className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-between flex-1 p-6 pt-2">
          
          {/* Title with Icon */}
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <IconComponent className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" />
              <h3 className="text-white text-xl font-bold">
                {solution.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-base mb-3 leading-relaxed">
              {solution.tagline}
            </p>

            {/* Features */}
            <p className="text-gray-400 text-sm leading-relaxed">
              {solution.features && solution.features.length > 0 
                ? solution.features.slice(0, 2).join(' • ')
                : 'Advanced features for enhanced productivity'
              }
            </p>
          </div>

          {/* CTA Button */}
          <button 
            onClick={handleClick}
            className="w-full bg-gradient-to-r from-purple-500/90 to-purple-800/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:from-purple-600/90 hover:to-purple-800/90 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black cursor-pointer flex items-center justify-center group"
          >
            <span className="mr-2">Try Now</span>
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Icon = ({ className, ...rest }: any) => {
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