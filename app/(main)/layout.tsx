import type { Metadata, Viewport } from "next";
import { AuthProvider } from "./components/layout_components/AuthProvider";
import NavbarClient from "./components/layout_components/NavbarClient"
import Footer from "./components/layout_components/Footer";
import CreditsProvider from "./components/layout_components/CreditsProvider";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-CG19BVRCRK';
const SITE_URL = process.env.NEXT_PUBLIC_KINDE_SITE_URL || 'https://automica.ai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
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
    images: [`${SITE_URL}/twitter-image.png`],
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
    google: 'your-google-verification-code', // ✅ TODO: Replace with actual verification code
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
  const user = await getUser();
  const roles = await getRoles();

  const isAdmin = roles?.some(role =>
    role.key === 'admin'
  );

  return (
    <AuthProvider>
      <CreditsProvider>
        {process.env.NODE_ENV === 'production' && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        )}
        <NavbarClient isAdmin={isAdmin} initialUser={user} />
        {children}
        <Footer />
      </CreditsProvider>
    </AuthProvider>
  );
}
