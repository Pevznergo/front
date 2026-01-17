
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Careers() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Join Our Team</h1>
                <p className="text-lg text-slate-600 mb-12 max-w-2xl">
                    Help us build the future of automated legal defense.
                </p>

                <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">No Open Positions</h3>
                    <p className="text-slate-600 mb-8">
                        We don't have any specific openings right now, but we are always looking for talented individuals.
                    </p>
                    <Link href="mailto:careers@aporto.tech" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                        Send Open Application
                    </Link>
                </div>
            </div>
            <Footer />
        </main>
    );
}
