"use client";

import React from "react";
import { Shield, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

// ValuesSection Component (transparent)
const ValuesSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "Enterprise-grade security with encryption, authentication, and compliance standards that protect your data and maintain privacy.",
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description: "We prioritize our customers' success with dedicated support, comprehensive documentation, and continuous improvement based on feedback.",
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "Constantly evolving our technology stack and expanding our API offerings to stay ahead of the rapidly changing AI landscape.",
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
              Our Foundation
            </span>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-3"></div>
          </div>

          <h2 className="text-5xl lg:text-7xl font-light text-white tracking-tight leading-tight mb-8">
            Our <span className="text-purple-400">Values</span>
          </h2>

          <p className="text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto font-light leading-relaxed">
            Core principles that{" "}
            <span className="text-purple-400 font-medium">drive innovation</span> and{" "}
            <span className="text-white font-medium">shape our future</span>
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <Item key={index} value={value} index={index} variants={itemVariants} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
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

const Item = ({ value, index, variants }: { value: any, index: number, variants: any }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <motion.div
      variants={variants}
      className="group relative"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className={`relative h-full p-8 lg:p-10 rounded-3xl backdrop-blur-xl transition-all duration-500 group-hover:transform group-hover:scale-105 overflow-hidden ${hoveredIndex === index
        ? 'bg-purple-500/10 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20'
        : 'bg-white/[0.02] border border-gray-800/30'
        }`}>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

        <div className="absolute -inset-4 border border-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-spin" style={{ animationDuration: '8s' }}></div>

        <div className="relative z-10">
          <div className="mb-8">
            <div className={`w-18 h-18 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${hoveredIndex === index
              ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/25'
              : 'bg-gray-900/50 border border-gray-800/50'
              }`}>
              <value.icon className={`w-9 h-9 transition-all duration-500 ${hoveredIndex === index
                ? 'text-white'
                : 'text-purple-400'
                }`} />

              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-500 ${hoveredIndex === index ? 'bg-purple-400 animate-pulse' : 'bg-gray-700'
                }`}></div>
            </div>
          </div>

          <h3 className="text-2xl lg:text-3xl font-light mb-6 text-white transition-all duration-300 tracking-tight">
            {value.title}
          </h3>

          <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed text-lg font-light transition-colors duration-500">
            {value.description}
          </p>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-full"></div>
        </div>

        <div className="absolute top-6 right-6 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      </div>

      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white font-medium text-sm transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-lg shadow-purple-500/30">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="absolute inset-0 rounded-3xl shadow-2xl shadow-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
    </motion.div>
  );
};

export default ValuesSection;