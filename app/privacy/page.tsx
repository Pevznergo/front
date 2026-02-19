
import Header from '../../components/Header';
import { SiteFooter } from '../../components/site-footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last updated: February 19, 2026</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p>
                            AportoTech ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy.
                            This policy describes the types of information we may collect from you or that you may provide when you visit the website aporto.tech (our "Website")
                            and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <p className="mb-4">We collect several types of information from and about users of our Website, including information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>By which you may be personally identified, such as name, email address, or other identifiers ("personal information").</li>
                            <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p className="mb-4">We use information that we collect about you or that you provide to us, including any personal information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To present our Website and its contents to you.</li>
                            <li>To provide you with information, products, or services that you request from us.</li>
                            <li>To fulfill any other purpose for which you provide it.</li>
                            <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
                            <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                        <p>
                            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.
                            The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Website,
                            you are responsible for keeping this password confidential.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Contact Information</h2>
                        <p>
                            To ask questions or comment about this privacy policy and our privacy practices, contact us at: <a href="mailto:support@aporto.tech" className="text-blue-600 hover:underline">support@aporto.tech</a>.
                        </p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
