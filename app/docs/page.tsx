import Header from '../../components/Header';
import { SiteFooter } from '../../components/site-footer';

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <Header />

      <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-6">Getting Started with Aporto API</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 border-l-4 border-blue-500 pl-4 italic">
          Welcome to Aporto. This guide walks you through the essential information you need to start integrating Aporto APIs into your product. We aim to be transparent, practical, and developer-friendly.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            1. Available Models & Playground
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We continuously update and onboard new models as soon as they are stable.</li>
            <li>Each model page links to its details, where you can see pricing and capabilities.</li>
            <li>Our <a href="/models" className="text-blue-600 hover:underline">Models page</a> is the best place to understand all available options.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            2. Pricing
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Our prices are typically competitive with or lower than official APIs.</li>
            <li>Pricing may change as upstream providers adjust their costs, so always refer to the <a href="/models" className="text-blue-600 hover:underline">Models page</a> for the latest numbers.</li>
            <li>We offer a unified billing system for all models.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            3. Creating and Securing Your API Key
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Treat your API key as a secret.
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Never</strong> expose your API key in frontend code (browser, mobile apps, public repositories).</li>
            <li>Use environment variables on your backend to store keys.</li>
            <li>We enforce rate limits per key to protect system stability.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            4. Required Request Headers
          </h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
            Authorization: Bearer &lt;YOUR_API_KEY&gt;<br />
            Content-Type: application/json
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            If your key is invalid or missing, you will receive:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
            {"{\"code\":401,\"msg\":\"You do not have access permissions\"}"}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            5. Rate Limits & Concurrency
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Rate limits are applied per account.</li>
            <li>Excessive requests will be rejected with <code>HTTP 429 Too Many Requests</code>.</li>
            <li>We recommend implementing exponential backoff for retries.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            6. Developer Support
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Get help via our Telegram bot: <a href="https://t.me/Aporto_bot" className="text-blue-600 hover:underline">@Aporto_bot</a></li>
            <li>We value your feedback and feature requests.</li>
            <li>For enterprise support, please contact us directly.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            7. Stability Expectations
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We strive for high availability, but we depend on upstream providers.</li>
            <li>If a specific model provider goes down, we try to route to alternatives where possible.</li>
            <li>Check our status page (coming soon) for real-time updates.</li>
          </ul>
        </section>

      </div>

      <SiteFooter />
    </main>
  );
}
