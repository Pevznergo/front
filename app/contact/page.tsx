
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Contact() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Contact Us</h1>
                <p className="text-lg text-slate-600 mb-12 max-w-2xl">
                    Have questions? We're here to help.
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Get in Touch</h3>
                        <p className="text-slate-600 mb-6">
                            Whether you have a specific question about a review or want to partner with us, drop us a line.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-900">Support</h4>
                                <a href="mailto:support@aporto.tech" className="text-blue-600 hover:underline">support@aporto.tech</a>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Sales</h4>
                                <a href="mailto:sales@aporto.tech" className="text-blue-600 hover:underline">sales@aporto.tech</a>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Address</h4>
                                <p className="text-slate-600">123 AI Boulevard, Tech City, TC 90210</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
