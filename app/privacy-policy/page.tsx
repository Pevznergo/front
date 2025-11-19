'use client'

import Navigation from '@/components/Navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Navigation />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <h1 className="text-4xl sm:text-5xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-gray-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-12 text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Aporto ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services
                            (collectively, the "Service").
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                        <p className="mb-4">We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Personal identification information (Name, email address, phone number, company name).</li>
                            <li>Billing and payment information.</li>
                            <li>Data you upload to our Service for processing (e.g., customer lists for win-back campaigns).</li>
                            <li>Communications you send to us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                        <p className="mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, operate, and maintain our Service.</li>
                            <li>Process your transactions and manage your account.</li>
                            <li>Execute win-back campaigns on your behalf using our AI agents.</li>
                            <li>Improve, personalize, and expand our Service.</li>
                            <li>Communicate with you, including for customer service, updates, and marketing purposes.</li>
                            <li>Detect and prevent fraud.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. AI and Data Processing</h2>
                        <p>
                            Our Service utilizes Artificial Intelligence (AI) technologies to analyze data and conduct voice conversations.
                            Data processed by our AI models is handled with strict confidentiality and security measures. We do not use your
                            proprietary customer data to train our general public models without your explicit consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
                        <p className="mb-4">We may share your information in the following situations:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Providers:</strong> We may share data with third-party vendors who perform services for us (e.g., cloud hosting, payment processing).</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                            <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information.
                            While we have taken reasonable steps to secure the personal information you provide to us, please be aware
                            that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission
                            can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Your Data Rights</h2>
                        <p className="mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>The right to access – You have the right to request copies of your personal data.</li>
                            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at: privacy@aporto.tech
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
