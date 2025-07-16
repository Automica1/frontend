'use client';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';

const logos = [
  { name: 'Microsoft', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg' },
  { name: 'Google', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg' },
  { name: 'Amazon', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg' },
  { name: 'Apple', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg' },
  { name: 'Meta', src: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
  { name: 'Netflix', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netflix/netflix-original.svg' },
  { name: 'Adobe', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/adobe/adobe-original.svg' },
  { name: 'Salesforce', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/salesforce/salesforce-original.svg' },
  { name: 'Oracle', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
  { name: 'IBM', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ibm/ibm-original.svg' },
  { name: 'Slack', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg' },
  { name: 'Spotify', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spotify/spotify-original.svg' },
];

export default function LogoMarquee() {
  return (
    <div className="w-full py-6 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-800">
      <Marquee speed={50} gradient={false} pauseOnHover>
        {logos.map((logo, i) => (
          <Image
            key={i}
            src={logo.src}
            alt={logo.name}
            title={logo.name}
            width={80}
            height={40}
            className="mx-6 h-10 grayscale hover:grayscale-0 transition duration-300"
            unoptimized
          />
        ))}
      </Marquee>
    </div>
  );
}
