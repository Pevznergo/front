import Link from 'next/link';
import { SearchBar } from './ui/search-bar';

export function HeroSection() {
    return (
        <section className="flex flex-col items-center justify-center pt-36 pb-12 px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                The Unified Interface For LLMs
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                Better <span className="text-blue-600">prices</span>, better <span className="text-blue-600">uptime</span>, no subscriptions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link
                    href="/docs"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Get API Key
                </Link>
                <Link
                    href="/models"
                    className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    Explore Models
                    <span className="bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded">AI</span>
                </Link>
            </div>
        </section>
    );
}
