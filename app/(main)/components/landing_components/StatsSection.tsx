"use client";

import React from "react";
import { Clock, Shield, Headphones } from "lucide-react";
import { motion } from "framer-motion";

// Stats Component (transparent)
const StatsSection = () => {
  const stats = [
    {
      icon: Clock,
      value: "< 3 sec",
      label: "Average Response Time",
      description: "Lightning-fast API responses"
    },
    {
      icon: Shield,
      value: "99.9%",
      label: "Uptime Guarantee",
      description: "Enterprise-grade reliability"
    },
    {
      icon: Headphones,
      value: "24/7",
      label: "Support Available",
      description: "Round-the-clock assistance"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as const;

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-8">
            <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">
              By The Numbers
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
          </div>

          <h2 className="text-4xl lg:text-6xl font-light text-white tracking-tight leading-tight mb-8">
            Trusted by <span className="text-purple-400">Thousands</span>
          </h2>

          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            Real metrics that demonstrate our{" "}
            <span className="text-purple-400 font-medium">commitment to excellence</span> and{" "}
            <span className="text-white font-medium">proven reliability</span>
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} index={index} variants={itemVariants} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1 }}
          className="flex justify-center items-center mt-20 space-x-4"
        >
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        </motion.div>
      </div>
    </section>
  );
};

const StatItem = ({ stat, index, variants }: { stat: any, index: number, variants: any }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const IconComponent = stat.icon;

  return (
    <motion.div
      variants={variants}
      className="group relative"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className={`relative h-full p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 group-hover:transform group-hover:scale-105 overflow-hidden border ${hoveredIndex === index
        ? 'bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border-purple-500/30 shadow-2xl shadow-purple-500/20'
        : 'bg-white/[0.02] border-white/10'
        }`}>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

        <div className="relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${hoveredIndex === index
              ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/25'
              : 'bg-white/5 border border-white/10'
              }`}>
              <IconComponent className={`w-8 h-8 transition-all duration-500 ${hoveredIndex === index
                ? 'text-white'
                : 'text-purple-400'
                }`} />
            </div>
          </div>

          <div className="text-4xl lg:text-5xl font-light text-white mb-3 tracking-tight">
            {stat.value}
          </div>

          <div className="text-lg font-light text-gray-300 mb-2 tracking-tight">
            {stat.label}
          </div>

          <div className="text-sm font-light text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
            {stat.description}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-full"></div>

        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      </div>

      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white font-medium text-xs transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-lg shadow-purple-500/30">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
    </motion.div>
  );
};
export default StatsSection;