
import Header from '../../components/Header';
import { SiteFooter } from '../../components/site-footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last updated: February 19, 2026</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the AportoTech website and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
                            If you do not agree to these Terms, you may not access or use the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p>
                            AportoTech provides a unified interface for accessing various AI language models. We reserve the right to modify, suspend, or discontinue the Service
                            at any time for any reason with or without notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                        <p>
                            To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account
                            and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
                        <p className="mb-4">You agree not to use the Service to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Violate any applicable national or international law or regulation.</li>
                            <li>Transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
                            <li>Impersonate or attempt to impersonate AportoTech, an AportoTech employee, another user, or any other person or entity.</li>
                            <li>Engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm AportoTech or users of the Service.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of AportoTech and its licensors.
                            The Service is protected by copyright, trademark, and other laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. AportoTech makes no representations or warranties of any kind, express or implied,
                            as to the operation of the Service or the information, content, or materials included therein.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                        <p>
                            In no event shall AportoTech be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption)
                            arising out of the use or inability to use the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at: <a href="mailto:support@aporto.tech" className="text-blue-600 hover:underline">support@aporto.tech</a>.
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
