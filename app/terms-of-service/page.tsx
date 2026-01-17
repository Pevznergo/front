
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-20">
                <div className="mb-10">
                    <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Home</Link>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
                    <p className="text-slate-500">Last updated: December 14, 2024</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <p>
                        Welcome to Aporto. By using our website and services, you agree to comply with and be bound by the following terms and conditions.
                    </p>

                    <h3>1. Services</h3>
                    <p>
                        Aporto provides automated tools to assist in drafting appeals for content removal on third-party platforms. We do not guarantee the removal of any content, as this decision is at the sole discretion of the platform (e.g., Google, Yelp).
                    </p>

                    <h3>2. Payments and Refunds</h3>
                    <p>
                        We operate on a "Success Based" model where applicable. Funds may be reserved on your payment method at the time of order. If the content is not removed within the specified timeframe, the funds will be released/refunded in accordance with our specific service agreement for that order.
                        Legal Escalation services (Stage 2) are optional and billed separately.
                    </p>

                    <h3>3. User Responsibilities</h3>
                    <p>
                        You agree to provide accurate information regarding the content you wish to report. You must not use our service to submit false or malicious claims.
                    </p>

                    <h3>4. Limitation of Liability</h3>
                    <p>
                        Aporto is not a law firm and does not provide legal advice. Our services are information-based tools. We are not liable for any damages arising from the use or inability to use our services.
                    </p>

                    <h3>5. Changes to Terms</h3>
                    <p>
                        We reserve the right to modify these terms at any time. Your continued use of the service constitutes acceptance of the new terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
