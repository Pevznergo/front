import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F2F7] relative">
      <Header />
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <FeaturesSection />
      {/* Pricing and other sections can be re-added later when adapted */}
      <Footer />
    </main>
  );
}