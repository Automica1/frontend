'use client';
import { ArrowRight, Network, Database, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import NetworkAnimation from './NetworkAnimation';

const SolutionsHero = () => {
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
    <section className="hero-gradient text-white pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
      <NetworkAnimation />
      
      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-[10%] p-3 rounded-full bg-white/5 backdrop-blur-sm"
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
          <Network className="text-automica-blue/70" size={24} />
        </motion.div>
        
        <motion.div 
          className="absolute top-2/3 right-[15%] p-3 rounded-full bg-white/5 backdrop-blur-sm"
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
          <Database className="text-automica-purple/70" size={24} />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 left-[20%] p-3 rounded-full bg-white/5 backdrop-blur-sm"
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
          <Cpu className="text-automica-blue/70" size={24} />
        </motion.div>
      </div>
      
      <div className="container text-center relative z-10">
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto"
          variants={titleVariants} 
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <span className="relative">
            Powerful AI APIs Built for Real-World Use
            <motion.span 
              className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-automica-blue to-automica-purple"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: "easeInOut"
          }}
        >
          Enterprise-grade AI solutions to solve complex business challenges across all industries
        </motion.p>
        
        {/* Animated arrow down indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
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
          <ArrowRight className="transform rotate-90 text-white/70" size={28} />
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionsHero;