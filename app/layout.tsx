// import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/components/AuthProvider";
import GoogleTagManager from '@/components/GoogleTagManager';

// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
// const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: {
    default: "Aporto - AI Review Removal & Legal Defense",
    template: "%s | Aporto"
  },
  description: "Automated AI agent for removing unfair negative reviews from Google, Yelp, and Glassdoor using legal policy audits.",
  openGraph: {
    title: "Aporto - AI Review Removal",
    description: "Delete unfair negative reviews with AI legal precision.",
    type: "website",
    locale: "en_US",
    url: "https://aporto.tech",
  },
};

import { Suspense } from 'react';

// ... imports

import Mixpanel from '@/components/Mixpanel';

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans antialiased")}>
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
