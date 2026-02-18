'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface Model {
    id: number;
    name: string;
    api_model_name: string;
    cost_fal: string | null;
    cost_our: string | null;
    description: string | null;
    created_at: string;
}

interface ModelsListProps {
    initialModels: Model[];
}

export function ModelsList({ initialModels }: ModelsListProps) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'newest' | 'name' | 'price'>('newest');

    const filteredModels = useMemo(() => {
        let result = initialModels.filter(m =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.api_model_name.toLowerCase().includes(query.toLowerCase())
        );

        if (sort === 'newest') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'price') {
            result.sort((a, b) => parseFloat(a.cost_our || '0') - parseFloat(b.cost_our || '0'));
        }

        return result;
    }, [initialModels, query, sort]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Models</h1>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0 md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="bg-gray-100 dark:bg-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                            placeholder="Search models..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <SlidersHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredModels.length} models
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        className="bg-transparent text-sm text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
                    >
                        <option value="newest">Newest</option>
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                    </select>
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="space-y-6">
                {filteredModels.map((model) => (
                    <div key={model.id} className="group border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                        <Link href={`/models/${model.id}`} className="block">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {model.name}
                                </h3>
                                <div className="text-xs text-gray-400 font-mono">
                                    {/* Placeholder for context length or other stat */}
                                    128k context
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                {model.description || "No description available."}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    by <span className="underline decoration-dotted">{model.api_model_name.split('/')[0] || 'Unknown'}</span>
                                </span>
                                <span>|</span>
                                <span>${model.cost_our ?? '0.00'}/1M tokens</span>
                                {model.cost_fal && (
                                    <>
                                        <span>|</span>
                                        <span className="text-gray-400">Est. Provider: ${model.cost_fal}</span>
                                    </>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}

                {filteredModels.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No models found matching "{query}"
                    </div>
                )}
            </div>
        </div>
    );
}
