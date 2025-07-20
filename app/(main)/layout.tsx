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

export const metadata: Metadata = {
  title: "Automica AI",
  description: "Plug and Play Ai Automation Platform",
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
