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

                        {/* Full API Documentation Section */}
                        <div className="mb-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                            <h2 className="text-2xl font-bold mb-6">API Documentation</h2>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3">Endpoint</h3>
                                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm mb-2 flex items-center">
                                    <span className="text-green-600 font-bold mr-2">POST</span>
                                    <span className="text-gray-800 dark:text-gray-200">https://api.aporto.tech/v1/chat/completions</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Fully compatible with OpenAI's Chat Completions API.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3">Usage Example</h3>
                                <ModelAPIViewer modelName={model.api_model_name} />
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3">Request Parameters</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Parameter</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Required</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
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
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3">Response Format</h3>
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
