import { sql } from '@/lib/db';
import Header from '../../../components/Header';
import { SiteFooter } from '../../../components/site-footer';
import Link from 'next/link';
import { CopyModelId } from '../../../components/ui/copy-model-id';

export const dynamic = 'force-dynamic';

export default async function ModelDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    let model = null;

    try {
        const models = await sql`SELECT * FROM models_new WHERE id = ${id}`;
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
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                {model.description || "No description available for this model."}
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-1">
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
                    </div>
                </div>

            </div>

            <SiteFooter />
        </main>
    );
}
