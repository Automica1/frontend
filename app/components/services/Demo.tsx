// Demo.tsx 
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "../ui/canvas-reveal-effect";
import { solutions, type SolutionKey } from "../../lib/solutions";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

// Define the most popular solutions (you can modify this array)
const POPULAR_SOLUTIONS: SolutionKey[] = [
  'face-verify',
  'qr-extract', 
  'signature-verification'
];

export function CanvasRevealEffectDemo() {
  const popularSolutions = POPULAR_SOLUTIONS.map(key => solutions[key]);

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
  solution: typeof solutions[SolutionKey];
  index: number;
}) => {
  const [hovered, setHovered] = React.useState(false);
  
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
      className="border border-white/[0.2] group/canvas-card flex flex-col items-center justify-between max-w-sm w-full mx-auto p-8 relative h-[36rem] overflow-hidden rounded-xl bg-black/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
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
              src={`/images/${index + 1}.svg`}
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
            <LoginLink 
              postLoginRedirectURL={`/services/${solution.slug}`}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
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
            </LoginLink>
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















// "use client";
// import React from "react";
// import { AnimatePresence, motion } from "motion/react";
// import { CanvasRevealEffect } from "../ui/canvas-reveal-effect";
// import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
// import { solutions, type SolutionKey } from "@/app/lib/solutions";

// const POPULAR_SOLUTIONS: SolutionKey[] = [
//   'face-verify',
//   'qr-extract', 
//   'signature-verification'
// ];

// export function CanvasRevealEffectDemo() {
//   const popularSolutions = POPULAR_SOLUTIONS.map(key => solutions[key]);
  
//   return (
//     <>
//       <div className="py-20 flex flex-col lg:flex-row items-center justify-center bg-black w-full gap-4 mx-auto px-8">
//         {popularSolutions.map((solution, index) => (
//           <Card 
//             key={solution.slug}
//             title={solution.title}
//             tagline={solution.tagline}
//             icon={<solution.icon/>}
//             slug={solution.slug}
//           >
//             <CanvasRevealEffect
//               animationSpeed={3}
//               containerClassName="bg-black"
//               colors={[
//                 [168, 85, 247],   // Tailwind purple-500
//                 [147, 51, 234],   // Tailwind purple-600
//               ]}
//               dotSize={2}
//             />
//             {/* Radial gradient for the cute fade - only on middle card */}
//             {index === 1 && (
//               <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/90" />
//             )}
//           </Card>
//         ))}
//       </div>
//     </>
//   );
// }

// const Card = ({
//   title,
//   tagline,
//   icon,
//   slug,
//   children,
//   showRibbon = true,
//   ribbonText = "Premium"
// }: {
//   title: string;
//   tagline: string;
//   icon: React.ReactNode;
//   slug: string;
//   children?: React.ReactNode;
//   showRibbon?: boolean;
//   ribbonText?: string;
// }) => {
//   const [hovered, setHovered] = React.useState(false);
  
//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className="border border-white/[0.2] group/canvas-card flex items-center justify-center max-w-sm w-full mx-auto p-4 relative h-[30rem] overflow-hidden"
//     >
//       {/* Corner Icons */}
//       <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
//       <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

//       {/* Corner Ribbon Badge */}
//       {showRibbon && (
//         <div className="absolute top-0 left-0 overflow-hidden w-32 h-32 pointer-events-none">
//           <div className="absolute top-4 -left-8 w-40 h-8 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 transform -rotate-45 flex items-center justify-center shadow-lg">
//             <span className="text-white text-xs font-semibold uppercase tracking-wider">
//               {ribbonText}
//             </span>
//           </div>
//           <div className="absolute top-0 left-0 w-3 h-3 bg-gradient-to-br from-red-600 to-orange-700 transform rotate-45 translate-x-28 translate-y-28 -z-10"></div>
//         </div>
//       )}

//       {/* Hover Animation */}
//       <AnimatePresence>
//         {hovered && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="h-full w-full absolute inset-0"
//           >
//             {children}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Card Content */}
//       <div className="relative z-20 flex flex-col items-center justify-center h-full w-full">
//         {/* Default state - shows icon and subtle title */}
//         <div className="text-center group-hover/canvas-card:-translate-y-8 group-hover/canvas-card:opacity-0 transition-all duration-300 w-full mx-auto flex flex-col items-center justify-center">
//           <div className="text-white text-5xl mb-4 transform group-hover/canvas-card:scale-110 transition-transform duration-300">
//             {icon}
//           </div>
//           <h3 className="text-white/80 text-lg font-medium tracking-wide">
//             {title}
//           </h3>
//           <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 mt-2 rounded-full"></div>
//         </div>
        
//         {/* Hover state - shows title, tagline, and button */}
//         <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/canvas-card:opacity-100 group-hover/canvas-card:-translate-y-2 transition duration-200 w-full px-6 text-center">
//           <div className="flex flex-col items-center justify-center flex-1 max-w-full">
//             <h2 className="text-white text-xl font-bold mb-3 text-center leading-tight">
//               {title}
//             </h2>
//             <p className="text-gray-300 text-sm mb-8 text-center leading-relaxed max-w-xs">
//               {tagline}
//             </p>
            
//             {/* Try Now Button */}
//             <LoginLink 
//               postLoginRedirectURL={`/services/${slug}`}
//               className="inline-flex items-center justify-center px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow hover:shadow-md min-w-[140px]"
//               // className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg min-w-[140px]"
//             >
//               Try Now
//             </LoginLink>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export const Icon = ({ className, ...rest }: any) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth="1.5"
//       stroke="currentColor"
//       className={className}
//       {...rest}
//     >
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
//     </svg>
//   );
// };




// const Card = ({
//   title,
//   icon,
//   children,
// }: {
//   title: string;
//   icon: React.ReactNode;
//   children?: React.ReactNode;
// }) => {
//   const [hovered, setHovered] = React.useState(false);
//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className="border border-white/[0.2] group/canvas-card flex items-center justify-center max-w-sm w-full mx-auto p-4 relative h-[30rem]"
//     >
//       <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
//       <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
//       <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

//       <AnimatePresence>
//         {hovered && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="h-full w-full absolute inset-0"
//           >
//             {children}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="relative z-20">
//         <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full  mx-auto flex items-center justify-center">
//           {icon}
//         </div>
//         <h2 className="text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
//           {title}
//         </h2>
//       </div>
//     </div>
//   );
// };