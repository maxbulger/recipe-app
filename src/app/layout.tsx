import type { Metadata } from "next";
import Link from 'next/link'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HealthBanner from '@/components/HealthBanner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "recipook",
  description: "recipook — a modern recipe app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-rose-50`}
      >
        <header className="sticky top-0 z-40 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 border-b border-orange-200/40 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <a className="sr-only" href="#main">Skip to content</a>
            <a className="sr-only" href="#nav">Skip to navigation</a>
            <a id="nav" className="sr-only" aria-hidden="true" />
            <Link href="/" className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600">
              recipook
            </Link>
          </div>
        </header>
        {/* Subtle food pattern background overlay */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.12]"
          style={{
            backgroundImage: "url('/food-pattern.svg')",
            backgroundRepeat: 'repeat',
            backgroundSize: '180px 180px',
          }}
        />
        <HealthBanner />
        <main id="main" className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
