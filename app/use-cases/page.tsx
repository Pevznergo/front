
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UseCases() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Use Cases</h1>
                <p className="text-lg text-slate-600 mb-8 max-w-2xl">
                    Discover how Aporto helps businesses across various industries protect their reputation and remove unfair negative reviews.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Placeholder for use cases */}
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Restaurants & Hospitality</h3>
                        <p className="text-slate-600">Remove fake reviews from competitors or disgruntled ex-employees that damage your rating.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Medical Practices</h3>
                        <p className="text-slate-600">Protect your practice from policy-violating reviews that mention staff names or confidential details.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Home Services</h3>
                        <p className="text-slate-600">Dispute reviews from people who were never actually customers.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Auto Dealerships</h3>
                        <p className="text-slate-600">Clean up spam and off-topic reviews that clutter your profile.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
