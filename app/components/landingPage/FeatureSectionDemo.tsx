// FeaturedSolution
import { cn } from "../../lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "AI-Powered Business Efficiency",
      description:
        "Drive smarter decision-making, automate processes, and unlock new levels of efficiency and productivity across your organization with our powerful AI solutions.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Easy to Use, Easy to Integrate",
      description:
        "Our AI APIs are designed for simplicity—quick to implement, effortless to use, and compatible with your existing systems.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Transparent Pricing",
      description:
        "Simple, transparent, and scalable pricing. No hidden costs. No vendor lock-in. Start small, grow seamlessly.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Enterprise-Grade Uptime & Reliability",
      description: "We guarantee industry-leading uptime and resilience. Your AI services remain uninterrupted, ensuring your business runs smoothly—always.",
      icon: <IconCloud />,
    },
    {
      title: "Enterprise Security & Compliance",
      description: "Built for the highest levels of security, privacy, and compliance. Our AI platform is trusted by enterprises across regulated industries to safeguard sensitive data and operations.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "24/7 Dedicated AI Support",
      description:
        "Our expert team, available around the clock to support your business, ensuring a smooth and hassle-free experience at every step.",
      icon: <IconHelp />,
    },
    // {
    //   title: "Data-Driven Insights for Smarter Decisions",
    //   description:
    //     "Turn complex data into clear, actionable insights that help your teams make faster, better-informed decisions.",
    //   icon: <IconAdjustmentsBolt />,
    // },
    // {
    //   title: "Scalable Solutions for Growing Businesses",
    //   description: "Our AI platform is built to scale effortlessly with your business needs—whether you're handling increasing volumes, expanding to new markets, or driving digital transformation.",
    //   icon: <IconHeart />,
    // },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature border-neutral-800",
        (index === 0 || index === 3) && "lg:border-l border-neutral-800",
        index < 3 && "lg:border-b border-neutral-800"
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-300 max-w-lg relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};