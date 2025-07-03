// "use client";
// import React from "react";
// import { motion } from "motion/react";

// type SpotlightProps = {
//   gradientFirst?: string;
//   gradientSecond?: string;
//   gradientThird?: string;
//   translateY?: number;
//   width?: number;
//   height?: number;
//   smallWidth?: number;
//   duration?: number;
//   xOffset?: number;
// };

// export const Spotlight = ({
//   gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)",
//   gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)",
//   gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
//   translateY = -350,
//   width = 560,
//   height = 1380,
//   smallWidth = 240,
//   duration = 7,
//   xOffset = 100,
// }: SpotlightProps = {}) => {
//   return (
//     <motion.div
//       initial={{
//         opacity: 0,
//       }}
//       animate={{
//         opacity: 1,
//       }}
//       transition={{
//         duration: 1.5,
//       }}
//       className="pointer-events-none absolute inset-0 h-full w-full"
//     >
//       <motion.div
//         animate={{
//           x: [0, xOffset, 0],
//         }}
//         transition={{
//           duration,
//           repeat: Infinity,
//           repeatType: "reverse",
//           ease: "easeInOut",
//         }}
//         className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
//       >
//         <div
//           style={{
//             transform: `translateY(${translateY}px) rotate(-45deg)`,
//             background: gradientFirst,
//             width: `${width}px`,
//             height: `${height}px`,
//           }}
//           className={`absolute top-0 left-0`}
//         />

//         <div
//           style={{
//             transform: "rotate(-45deg) translate(5%, -50%)",
//             background: gradientSecond,
//             width: `${smallWidth}px`,
//             height: `${height}px`,
//           }}
//           className={`absolute top-0 left-0 origin-top-left`}
//         />

//         <div
//           style={{
//             transform: "rotate(-45deg) translate(-180%, -70%)",
//             background: gradientThird,
//             width: `${smallWidth}px`,
//             height: `${height}px`,
//           }}
//           className={`absolute top-0 left-0 origin-top-left`}
//         />
//       </motion.div>

//       <motion.div
//         animate={{
//           x: [0, -xOffset, 0],
//         }}
//         transition={{
//           duration,
//           repeat: Infinity,
//           repeatType: "reverse",
//           ease: "easeInOut",
//         }}
//         className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none"
//       >
//         <div
//           style={{
//             transform: `translateY(${translateY}px) rotate(45deg)`,
//             background: gradientFirst,
//             width: `${width}px`,
//             height: `${height}px`,
//           }}
//           className={`absolute top-0 right-0`}
//         />

//         <div
//           style={{
//             transform: "rotate(45deg) translate(-5%, -50%)",
//             background: gradientSecond,
//             width: `${smallWidth}px`,
//             height: `${height}px`,
//           }}
//           className={`absolute top-0 right-0 origin-top-right`}
//         />

//         <div
//           style={{
//             transform: "rotate(45deg) translate(180%, -70%)",
//             background: gradientThird,
//             width: `${smallWidth}px`,
//             height: `${height}px`,
//           }}
//           className={`absolute top-0 right-0 origin-top-right`}
//         />
//       </motion.div>
//     </motion.div>
//   );
// };

"use client";
import React from "react";
import { motion } from "motion/react";

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

export const Spotlight = ({
  // Updated gradients to match your purple theme
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(280, 100%, 85%, .12) 0, hsla(270, 100%, 65%, .04) 50%, hsla(260, 100%, 45%, 0) 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(285, 100%, 85%, .08) 0, hsla(275, 100%, 55%, .03) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(290, 100%, 85%, .06) 0, hsla(280, 100%, 45%, .02) 80%, transparent 100%)",
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
      }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {/* Left spotlight group */}
      <motion.div
        animate={{
          x: [0, xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      {/* Right spotlight group */}
      <motion.div
        animate={{
          x: [0, -xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>

      {/* Additional orbital accent - inspired by your circular design elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 w-96 h-96 pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(50% 50% at 50% 50%, hsla(285, 100%, 75%, .02) 0, transparent 70%)",
        }}
      />
    </motion.div>
  );
};