import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/components/AuthProvider";
import GoogleTagManager from '@/components/GoogleTagManager';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: {
    default: "Aporto — The Speed of Thought for your AI Stack",
    template: "%s | Aporto"
  },
  description: "Sub-millisecond routing, 40% cost reduction, and zero-latency infrastructure. The high-performance API Gateway for all AI applications.",
  openGraph: {
    title: "Aporto — The Speed of Thought for your AI Stack",
    description: "Stop waiting for your LLM. Start scaling. 150,000+ requests daily, 5x faster TTFT, 50+ AI providers integrated.",
    type: "website",
    url: "https://aporto.tech",
  },
};

import { Suspense } from 'react';

// ... imports

import Mixpanel from '@/components/Mixpanel';

import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={cn("font-sans antialiased", inter.variable)}>
        <Suspense fallback={null}>
          <GoogleTagManager />
        </Suspense>
        <Mixpanel />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
