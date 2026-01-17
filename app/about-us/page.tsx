
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutUs() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">About Aporto</h1>

                <div className="prose prose-slate max-w-3xl">
                    <p className="text-lg text-slate-600 mb-6">
                        Aporto is an AI-powered legal technology company dedicated to helping businesses defend their online reputation.
                    </p>
                    <p className="text-lg text-slate-600 mb-6">
                        We believe that fair and honest reviews are the backbone of the digital economy. However, fake, biased, and policy-violating reviews can unfairly destroy a hard-earned reputation in minutes.
                    </p>
                    <p className="text-lg text-slate-600 mb-6">
                        Our mission is to level the playing field by providing every business owner with an "AI Lawyer" that knows platform policies inside and out, ensuring your side of the story is heard and respected.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
