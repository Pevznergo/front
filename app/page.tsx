import Header from '../components/Header';
import { HeroSection } from '../components/hero-section';
import { StatsSection } from '../components/stats-section';
import { SiteFooter } from '../components/site-footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <Header />

      <div className="flex-grow flex flex-col">
        {/* Main Content Area */}
        <HeroSection />

        {/* Stats Section */}
        <StatsSection />
      </div>

      <SiteFooter />
    </main>
  );
}