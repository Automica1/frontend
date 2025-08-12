import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
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
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#da532c',
    'msapplication-config': '/browserconfig.xml',
  },
};

// Separate viewport export (NEW - this fixes the warnings)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
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