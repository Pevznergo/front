
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuccessStories() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Success Stories</h1>
                <p className="text-lg text-slate-600 mb-12 max-w-2xl">
                    See how businesses reclaimed their online reputation with Aporto.
                </p>

                <div className="grid gap-8">
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">D</div>
                            <div>
                                <h3 className="font-bold text-slate-900">Dr. Smith's Dental</h3>
                                <p className="text-sm text-slate-500">Medical Practice</p>
                            </div>
                        </div>
                        <p className="text-slate-600 italic mb-4">"We had a 1-star review from someone who never even visited our office. Aporto identified it as spam and got it removed in 3 days. Our rating is back to 4.9!"</p>
                    </div>

                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">B</div>
                            <div>
                                <h3 className="font-bold text-slate-900">Bella Italia</h3>
                                <p className="text-sm text-slate-500">Restaurant</p>
                            </div>
                        </div>
                        <p className="text-slate-600 italic mb-4">"A former employee posted fake negative reviews. Aporto drafted the exact legal argument we needed to prove Conflict of Interest to Google."</p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
