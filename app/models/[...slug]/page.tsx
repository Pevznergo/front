import { sql } from '@/lib/db';
import Header from '../../../components/Header';
import { SiteFooter } from '../../../components/site-footer';
import Link from 'next/link';
import { CopyModelId } from '../../../components/ui/copy-model-id';
import { ModelAPIViewer } from '../../../components/model-api-viewer';

export const dynamic = 'force-dynamic';

export default async function ModelDetailsPage({ params }: { params: { slug: string[] } }) {
    const { slug } = params;
    // Join slug parts to form the full model ID (e.g., "google/gemini-2.0-flash-exp")
    // If slug is somehow undefined or empty, handle gracefully
    const modelId = slug?.join('/');

    let model = null;

    try {
        // Query by api_model_name instead of id
        const models = await sql`SELECT * FROM models_new WHERE api_model_name = ${modelId}`;
        if (models.length > 0) {
            model = models[0];
        }
    } catch (error) {
        console.error("Failed to fetch model:", error);
    }

    if (!model) {
        return (
            <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
                <Header />
                <div className="flex-grow pt-24 pb-12 px-4 max-w-7xl mx-auto w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">Model not found</h1>
                    <p className="text-gray-600 mb-6">Could not find model with ID: {modelId}</p>
                    <Link href="/models" className="text-blue-600 hover:underline">Back to Models</Link>
                </div>
                <SiteFooter />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            <Header />

            <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <Link href="/models" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 inline-block">
                        ← Back to Models
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">{model.name}</h1>
                    <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                            {model.api_model_name}
                        </code>
                        <CopyModelId id={model.api_model_name} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <div className="prose dark:prose-invert max-w-none mb-12">
                            <h3 className="text-xl font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                {model.description || "No description available for this model."}
                            </p>
                        </div>

                        {/* Key Features Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold mb-6">Key Features of {model.name} API</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="font-semibold text-lg mb-2">Advanced Reasoning</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Capable of handling complex multi-step problems with enhanced logic and deduction capabilities, making it ideal for sophisticated applications.
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="font-semibold text-lg mb-2">Multimodal Input</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Process and analyze text, images, and other media types simultaneously to derive richer insights and context-aware responses.
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="font-semibold text-lg mb-2">Large Context Window</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Maintain coherence over long conversations and analyze extensive documents without losing track of critical details.
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="font-semibold text-lg mb-2">Structure Outputs</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Generate strictly formatted JSON or other structured data types, perfect for integration into automated pipelines and databases.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Use Cases Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold mb-6">Building with {model.name}</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Long-document Analysis</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Ingest and summarize entire reports, legal contracts, or technical manuals in a single pass using the expanded context window.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Generate Runnable Code</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Transform natural language descriptions into functional, clean code across multiple languages, complete with comments and documentation.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Mixed Media Analysis</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Combine charts, screenshots, and text instructions to perform complex visual reasoning tasks in a single API call.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deployment/Integration Section (Step-by-Step) */}
                        <div className="mb-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                            <h2 className="text-2xl font-bold mb-8">Deployment and Integration</h2>

                            {/* Step 1 */}
                            <div className="mb-10">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                                    Endpoint Configuration
                                </h3>
                                <div className="ml-8">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Configure your client to use the AportoTech base URL. This endpoint is fully compatible with OpenAI's client libraries.
                                    </p>
                                    <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm mb-2 flex items-center">
                                        <span className="text-blue-600 font-bold mr-2">Base URL:</span>
                                        <span className="text-gray-800 dark:text-gray-200">https://api.aporto.tech/v1</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="mb-10">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                                    Authentication
                                </h3>
                                <div className="ml-8">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Authenticate your requests by including your API key in the <code>Authorization</code> header.
                                    </p>
                                    <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                        Authorization: Bearer YOUR_API_KEY
                                    </pre>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="mb-10">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                                    Make a Request
                                </h3>
                                <div className="ml-8">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Use the code below to send your first request to <strong>{model.name}</strong>.
                                    </p>
                                    <ModelAPIViewer modelName={model.api_model_name} />
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="mb-10">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                                    Parameters & Response
                                </h3>
                                <div className="ml-8">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Review the supported parameters and expected response format for fine-tuning your integration.
                                    </p>

                                    {/* Parameters Table */}
                                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Parameter</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Required</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                                                <tr>
                                                    <td className="px-4 py-2 font-mono">model</td>
                                                    <td className="px-4 py-2">string</td>
                                                    <td className="px-4 py-2 text-red-500">Yes</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">ID of the model to use (e.g. <code>{model.api_model_name}</code>)</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-mono">messages</td>
                                                    <td className="px-4 py-2">array</td>
                                                    <td className="px-4 py-2 text-red-500">Yes</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">A list of messages comprising the conversation so far.</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-mono">temperature</td>
                                                    <td className="px-4 py-2">number</td>
                                                    <td className="px-4 py-2 text-gray-500">No</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Sampling temperature (0 to 2). Higher values like 0.8 make output more random, lower values like 0.2 make it more focused.</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-mono">stream</td>
                                                    <td className="px-4 py-2">boolean</td>
                                                    <td className="px-4 py-2 text-gray-500">No</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">If set, partial message deltas will be sent.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <h4 className="text-sm font-semibold mb-2">Sample Response</h4>
                                    <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                        {`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "${model.api_model_name}",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Pricing</h3>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Our Price</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        ${model.cost_our ?? '0.00'}<span className="text-sm font-normal text-gray-500">/1M tokens</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Provider Price (Est.)</div>
                                    <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                        ${model.cost_fal ?? '0.00'}<span className="text-sm font-normal text-gray-500">/1M tokens</span>
                                    </div>
                                </div>

                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors mt-4">
                                    Try in Chat
                                </button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900 text-sm text-blue-800 dark:text-blue-200">
                                <p className="mb-2 font-semibold">Need higher limits?</p>
                                <p>Contact support for enterprise grade throughput and custom dedicated deployments.</p>
                                <a href="mailto:support@aporto.tech" className="block mt-3 text-blue-600 hover:underline font-medium">Contact Sales →</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <SiteFooter />
        </main>
    );
}
