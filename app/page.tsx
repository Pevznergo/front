import Header from '../components/Header';
import { HeroSection } from '../components/hero-section';

import { SiteFooter } from '../components/site-footer';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aporto - The Unified Interface For LLMs',
  description: 'Better prices, better uptime, no subscriptions. Access the world\'s best AI models like GPT-4, Claude 3.5 Sonnet, and Gemini 1.5 Pro through a single unified API.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <Header />

      <div className="flex-grow flex flex-col">
        {/* Main Content Area */}
        <HeroSection />
      </div>

      <SiteFooter />
    </main>
  );
}