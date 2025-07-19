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
      className="border border-white/[0.2] group/canvas-card flex flex-col items-center justify-between max-w-sm w-full mx-auto p-8 relative h-[36rem] overflow-hidden rounded-xl bg-black/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
    >
      {/* Corner Icons */}
      <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white opacity-60" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white opacity-60" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white opacity-60" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white opacity-60" />

      {/* Corner Ribbon Badge */}
      <div className="z-50 absolute top-0 left-0 overflow-hidden w-28 h-28 pointer-events-none">
        <div className="absolute top-3 -left-7 w-36 h-7 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 transform -rotate-45 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-semibold uppercase tracking-wider">
            Popular
          </span>
        </div>
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

      {/* Card Content */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full w-full">
        {/* Image Section - Always visible */}
        <div className="text-center w-full mx-auto flex items-center justify-center pt-0">
          <div className="relative w-full rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.05]">
            <img 
              src={solution.imageSrc}
              alt={solution.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>

        {/* Always visible content */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 mt-8">
          <h3 className="text-white text-1xl lg:text-2xl font-bold mb-3 text-center relative">
            {solution.title}
            {/* Highlight underline */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"></div>
          </h3>
          <p className="text-white/80 text-sm lg:text-base text-center mb-4 leading-relaxed max-w-xs">
            {solution.tagline}
          </p>
          
          {/* Try Now Button - Always visible */}
          <div className="mt-auto">
            <button 
              onClick={handleClick}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500/90 to-purple-800/90 text-white font-medium text-lg rounded-lg transition-all duration-300 hover:from-purple-600/90 hover:to-purple-800/90 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
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

