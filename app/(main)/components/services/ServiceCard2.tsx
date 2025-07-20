// components/services/ServiceCard2.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from 'lucide-react';
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500",
    outline:
      "border border-gray-500 text-gray-200 hover:bg-gray-800 focus:ring-gray-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

type Service = {
  imageSrc: string | Blob | undefined;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  link?: string;
  gradient?: string;
  features?: string[];
};

type ServiceCard2Props = {
  // For array usage (original ServiceCard2 behavior)
  solutions?: Service[];
  services?: Service[];
  // For individual service usage (ServiceCard behavior)
  service?: Service;
  index?: number;
  hoveredCard?: number | null;
  setHoveredCard?: (index: number | null) => void;
};

const ServiceCard2: React.FC<ServiceCard2Props> = ({ 
  solutions = [], 
  services = [],
  service,
  index = 0,
  hoveredCard = null,
  setHoveredCard = () => {}
}) => {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const handleCardClick = (service: Service) => {
    if (service.link) {
      router.push(service.link);
    }
  };

  const handleLearnMoreClick = (e: React.MouseEvent<HTMLButtonElement>, service: Service) => {
    e.stopPropagation();
    if (service.link) {
      router.push(service.link);
    }
  };

  // If service prop is provided, render single service card
  if (service) {
    const Icon = service.icon;

    return (
      <motion.div
        className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 cursor-pointer group"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        onMouseEnter={() => setHoveredCard(index)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => handleCardClick(service)}
      >
        {/* Mobile Layout */}
        <div className="flex flex-col lg:hidden">
          {/* Mobile Image Section - Full width and taller */}
          <div className={`w-full h-64 bg-gradient-to-br ${service.gradient || 'from-purple-500/20 to-blue-500/20'} p-8 flex items-center justify-center relative overflow-hidden`}>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={service.imageSrc}
                alt={service.title}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </div>
          
          {/* Mobile Content Section */}
          <div className="flex-1 p-6">
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-gray-300 mb-4 leading-relaxed text-sm">{service.description}</p>

            {service.features && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">
                  Key Features
                </h4>
                <div className="space-y-2">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start text-sm text-gray-300">
                      <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-green-400" />
                      </div>
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={(e) => handleLearnMoreClick(e, service)}
              className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white shadow-lg transition-all duration-300 group/btn w-full"
            >
              <span className="mr-2">Learn More</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row">
          {/* Desktop Icon Section */}
          <div className={`w-80 bg-gradient-to-br ${service.gradient || 'from-purple-500/20 to-blue-500/20'} p-12 flex items-center justify-center`}>
            <img
              src={service.imageSrc}
              alt={service.title}
              className="object-contain group-hover:scale-110 transition-transform duration-300"
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          </div>

          {/* Desktop Content Section */}
          <div className="flex-1 p-8">
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>

            {service.features && (
              <div className="mb-8">
                <h4 className="text-sm font-semibold uppercase text-gray-400 mb-4 tracking-wider">
                  Key Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={(e) => handleLearnMoreClick(e, service)}
              className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white shadow-lg transition-all duration-300 group/btn"
            >
              <span className="mr-2">Learn More</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Use solutions if provided, otherwise use services
  const mainServices = solutions.length > 0 ? solutions : services;

  return (
    <section className="section-padding">
      <div className="container">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Main Services */}
          {mainServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 cursor-pointer group"
                variants={itemVariants}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(service)}
              >
                {/* Mobile Layout */}
                <div className="flex flex-col lg:hidden">
                  {/* Mobile Image Section */}
                  <div className={`w-full h-64 bg-gradient-to-br ${service.gradient || 'from-purple-500/20 to-blue-500/20'} p-8 flex items-center justify-center`}>
                    <div className="relative w-full h-full flex items-center justify-center">
                      {service.imageSrc ? (
                        <img
                          src={service.imageSrc}
                          alt={service.title}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient || 'from-purple-500 to-blue-500'} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Content */}
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed text-sm">{service.description}</p>

                    {service.features && (
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">
                          Key Features
                        </h4>
                        <div className="space-y-2">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-start text-sm text-gray-300">
                              <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 text-green-400" />
                              </div>
                              <span className="text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={(e) => handleLearnMoreClick(e, service)}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-300 group/btn w-full"
                    >
                      <span className="mr-2">Learn More</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex flex-row">
                  {/* Desktop Icon Section */}
                  <div className="lg:w-80 bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-12 flex items-center justify-center">
                    {service.imageSrc ? (
                      <img
                        src={service.imageSrc}
                        alt={service.title}
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    ) : (
                      <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient || 'from-purple-500 to-blue-500'} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  {/* Desktop Content Section */}
                  <div className="flex-1 p-8">
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>

                    {service.features && (
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold uppercase text-gray-400 mb-4 tracking-wider">
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-300">
                              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <Check className="w-3 h-3 text-green-400" />
                              </div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={(e) => handleLearnMoreClick(e, service)}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-300 group/btn"
                    >
                      <span className="mr-2">Learn More</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCard2;