// 1. Update your layout.tsx to use environment-based metadata
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/layout_components/AuthProvider";
import Navbar from "./components/layout_components/Navbar"
import Footer from "./components/layout_components/Footer";
import CreditsProvider from "./components/layout_components/CreditsProvider";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
// Check if this is production environment
const isProduction = process.env.NODE_ENV === 'production' && 
                     process.env.NEXT_PUBLIC_SITE_URL === 'https://automica.ai';

                     
// Enhanced SEO metadata - only for production
console.log('isProduction:', isProduction);

// console.log('All env vars:', process.env);
// console.log('CWD:', process.cwd());
// console.log('Files in root:', require('fs').readdirSync('.'));
export const metadata: Metadata = isProduction ? {
  title: {
    default: "Automica AI - Plug and Play AI Automation Platform",
    template: "%s | Automica AI"
  },
  description: "Transform your business with Automica AI's plug and play automation platform. Build intelligent workflows, automate tasks, and boost productivity with our AI-powered solutions.",
  keywords: [
    "AI automation",
    "artificial intelligence",
    "workflow automation", 
    "business automation",
    "AI platform",
    "machine learning",
    "productivity tools",
    "automation software",
    "AI solutions",
    "intelligent automation"
  ],
  authors: [{ name: "Automica AI Team" }],
  creator: "Automica AI",
  publisher: "Automica AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://automica.ai'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'en': '/en',
    },
  },
  openGraph: {
    title: "Automica AI - Plug and Play AI Automation Platform",
    description: "Transform your business with Automica AI's plug and play automation platform. Build intelligent workflows, automate tasks, and boost productivity with our AI-powered solutions.",
    url: 'https://automica.ai',
    siteName: 'Automica AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Automica AI - AI Automation Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Automica AI - Plug and Play AI Automation Platform",
    description: "Transform your business with Automica AI's plug and play automation platform. Build intelligent workflows, automate tasks, and boost productivity.",
    images: ['/twitter-image.png'],
    creator: '@AutomicaAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'AI Automation Platform',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#da532c',
    'msapplication-config': '/browserconfig.xml',
  },
} : {
  // Development metadata - blocks SEO
  title: "Automica AI - Development Environment",
  description: "Development environment - not for public access",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  other: {
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { getUser, getRoles } = getKindeServerSession();
  const roles = await getRoles();

  const isAdmin = roles?.some(role => 
        role.key === 'admin'
      );

  return (
    <AuthProvider>
     <CreditsProvider>
      <html lang="en">
       <head>
         {/* Conditional SEO meta tags - only for production */}
         {isProduction ? (
           <>
             <link rel="canonical" href="https://automica.ai" />
             <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
             <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
             
             {/* Structured Data for Organization */}
             <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                 __html: JSON.stringify({
                   "@context": "https://schema.org",
                   "@type": "Organization",
                   "name": "Automica AI",
                   "url": "https://automica.ai",
                   "logo": "https://automica.ai/logo.png",
                   "description": "Plug and Play AI Automation Platform",
                   "sameAs": [
                     "https://twitter.com/AutomicaAI",
                     "https://linkedin.com/company/automica-ai"
                   ],
                   "contactPoint": {
                     "@type": "ContactPoint",
                     "contactType": "customer service",
                     "email": "support@automica.ai"
                   }
                 })
               }}
             />

             {/* Structured Data for Software Application */}
             <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                 __html: JSON.stringify({
                   "@context": "https://schema.org",
                   "@type": "SoftwareApplication",
                   "name": "Automica AI",
                   "description": "Plug and Play AI Automation Platform",
                   "url": "https://automica.ai",
                   "applicationCategory": "BusinessApplication",
                   "operatingSystem": "Web",
                   "offers": {
                     "@type": "Offer",
                     "price": "0",
                     "priceCurrency": "USD"
                   },
                   "author": {
                     "@type": "Organization",
                     "name": "Automica AI"
                   }
                 })
               }}
             />

             {/* Preconnect to external domains for performance */}
             <link rel="preconnect" href="https://fonts.googleapis.com" />
             <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
             
             {/* DNS prefetch for external resources */}
             <link rel="dns-prefetch" href="//fonts.googleapis.com" />
             <link rel="dns-prefetch" href="//fonts.gstatic.com" />
           </>
         ) : (
           // Development environment - block all crawlers
           <>
             <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
             <meta name="googlebot" content="noindex, nofollow" />
             <meta name="X-Robots-Tag" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
           </>
         )}
       </head>
       <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Navbar isAdmin={isAdmin} />
        {children}
        <Footer/>
       </body>
     </html>
     </CreditsProvider>
    </AuthProvider>
  );
}