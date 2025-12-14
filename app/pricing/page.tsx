
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingComponent from '@/components/Pricing';

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#F2F2F7]">
            <Header />
            <div className="pt-32 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-lg text-slate-600">Only pay when you see results.</p>
                </div>
            </div>
            <PricingComponent />
            <Footer />
        </main>
    );
}
