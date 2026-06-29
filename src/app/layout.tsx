import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import MobileDesktopBanner from "@/components/MobileDesktopBanner";
import { validateEnv } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXORITHM | Code. Compete. Earn.",
  description: "Build coding consistency, climb rankings, earn rewards, and prove your skills through real problem solving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateEnv();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <AppProvider>
            <MobileDesktopBanner />
            <Header />
            {children}
          </AppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
