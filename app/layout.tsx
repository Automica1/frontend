import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./AuthProvider";
import Navbar from "./components/landingPage/Navbar"
import Footer from "./components/landingPage/Footer";
import CreditsProvider from "./components/CreditsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automica AI",
  description: "Plug and Play Ai Automation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
     <CreditsProvider>
      <html lang="en">
       <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Navbar/>
        {children}
        <Footer/>
       </body>
     </html>
     </CreditsProvider>
    </AuthProvider>
  );
}
