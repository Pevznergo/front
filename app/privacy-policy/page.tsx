
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-20">
                <div className="mb-10">
                    <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Home</Link>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
                    <p className="text-slate-500">Last updated: December 14, 2024</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <p>
                        At Aporto AI, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect information you provide directly to us, such as your email address when you create an account, and the content of reviews you submit for analysis.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        We use your information to:
                        <ul>
                            <li>Provide and improve our services.</li>
                            <li>Process transactions and send related information.</li>
                            <li>Communicate with you about our services.</li>
                        </ul>
                    </p>

                    <h3>3. Data Security</h3>
                    <p>
                        We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                    </p>

                    <h3>4. Third-Party Services</h3>
                    <p>
                        We may use third-party services (like payment processors or authentication providers) that collect, process, and store information about you.
                    </p>

                    <h3>5. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us.
                    </p>
                </div>
            </div>
        </div>
    );
}
