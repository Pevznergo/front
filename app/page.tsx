import Header from '../components/Header';
import { HeroSection } from '../components/hero-section';
import { StatsSection } from '../components/stats-section';
import { UseCasesSection } from '../components/use-cases-section';
import { TechnicalSection } from '../components/technical-section';
import { CTASection } from '../components/cta-section';
import { SiteFooter } from '../components/site-footer';
import { WaitlistModal } from '../components/waitlist-modal';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aporto — The Speed of Thought for your AI Stack',
  description: 'Sub-millisecond routing, 40% cost reduction, and zero-latency infrastructure. The high-performance API Gateway for all AI applications.',
  openGraph: {
    title: 'Aporto — The Speed of Thought for your AI Stack',
    description: 'Stop waiting for your LLM. Start scaling. Sub-millisecond routing, 50+ AI providers, auto-failover.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-carbon-900 flex flex-col font-sans text-carbon-100">
      <Header />
      <div className="flex-grow flex flex-col">
        <HeroSection />
        <StatsSection />
        <UseCasesSection />
        <TechnicalSection />
        <CTASection />
      </div>
      <SiteFooter />
      <WaitlistModal />
    </main>
  );
}