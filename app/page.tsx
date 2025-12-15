
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ComparisonTable from '../components/ComparisonTable';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F2F7] relative">
      <Header />
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <HowItWorks />
      <ComparisonTable />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}