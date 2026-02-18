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
          Welcome to Aporto. This guide walks you through the essential information you need to start integrating Aporto APIs into your product, including models, pricing, authentication, request flow, limits, and support. We aim to be transparent, practical, and developer-friendly. Please read this carefully before going to production.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            1. Available Models & Playground
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We continuously update and onboard new models as soon as they are stable.</li>
            <li>Each model page links to its details, where you can test and experiment directly in our UI before calling the API.</li>
            <li>The Playground (Chat) is the best place to understand model behavior, parameters, and output formats.</li>
            <li>See all models on our <a href="/models" className="text-blue-600 hover:underline">Models page</a>.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            2. Pricing
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Our prices are typically 30%–50% lower than official APIs.</li>
            <li>For some models, discounts can reach up to 80%.</li>
            <li>Pricing may change as upstream providers adjust their costs, so always refer to the <a href="/models" className="text-blue-600 hover:underline">Models page</a> for the latest numbers.</li>
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
            <li>Rate limits per key (hourly, daily, and total usage caps) are enforced.</li>
            <li>Use environment variables on your backend to store keys securely.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            4. API Base URL
          </h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
            https://api.aporto.tech/v1
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This is an OpenAI-compatible endpoint. You can use it with the official OpenAI SDKs by changing the <code>base_url</code>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            5. Required Request Headers
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
            6. Logs & Task Details
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We provide detailed logs for every request.</li>
            <li>Creation time, Model used, Input parameters.</li>
            <li>Task status, Credit consumption.</li>
            <li>Final results or error details.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            7. Data Retention Policy
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Generated media files: stored for 14 days, then automatically deleted.</li>
            <li>Log records (text / metadata): stored for 2 months, then automatically deleted.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            8. Asynchronous Task Model
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Requests return HTTP 200 and a <code>task_id</code> immediately.</li>
            <li>You can provide a callback (webhook) URL in the request.</li>
            <li>Or actively poll the “query record info” API using the <code>task_id</code>.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            9. Rate Limits & Concurrency
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Up to 20 new generation requests per 10 seconds.</li>
            <li>This typically allows 100+ concurrent running tasks.</li>
            <li>Limits are applied per account.</li>
            <li>Excessive requests will be rejected with <code>HTTP 429</code>.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            10. Developer Support
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Get help regarding API integration or account issues.</li>
            <li>Email us at: <a href="mailto:support@aporto.tech" className="text-blue-600 hover:underline">support@aporto.tech</a></li>
            <li>Your data and conversations remain confidential.</li>
            <li>We aim for fast and technical responses.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            11. Stability Expectations
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We are not perfect, but we strive for high availability.</li>
            <li>Our overall stability may be slightly lower than official providers due to aggregation complexity.</li>
            <li>This is a conscious trade-off for significantly lower prices and unified access.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            12. About the Team
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>We move fast and care deeply about developer experience.</li>
            <li>We are constantly improving our infrastructure.</li>
            <li>Not everything is perfect, but we are transparent about it.</li>
            <li>We can’t satisfy every use case immediately, but we listen to feedback.</li>
          </ul>
        </section>

      </div>

      <SiteFooter />
    </main>
  );
}
