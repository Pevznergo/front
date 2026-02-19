'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { CopyModelId } from './ui/copy-model-id';

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
    const [sort, setSort] = useState<'newest' | 'name' | 'price' | 'discount'>('newest');

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
        } else if (sort === 'discount') {
            result.sort((a, b) => {
                const getDiscount = (m: Model) => {
                    if (!m.cost_fal || !m.cost_our) return 0;
                    const fal = parseFloat(m.cost_fal);
                    const our = parseFloat(m.cost_our);
                    if (fal === 0) return 0;
                    return ((fal - our) / fal) * 100;
                };
                return getDiscount(b) - getDiscount(a);
            });
        }

        return result;
    }, [initialModels, query, sort]);

    const getProviderName = (apiModelName: string) => {
        const parts = apiModelName.split('/');
        let provider = parts[0] || 'Unknown';
        if (provider.toLowerCase().includes('gemini') || apiModelName.toLowerCase().includes('gemini')) {
            return 'Google';
        }
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    };

    const calculateDiscount = (our: string | null, fal: string | null) => {
        if (!our || !fal) return null;
        const ourPrice = parseFloat(our);
        const falPrice = parseFloat(fal);
        if (isNaN(ourPrice) || isNaN(falPrice) || falPrice === 0) return null;

        const discount = ((falPrice - ourPrice) / falPrice) * 100;
        if (discount <= 0) return null;
        return discount.toFixed(1);
    };

    const formatPrice = (price: string | null) => {
        if (!price) return '0.00';
        const num = parseFloat(price);
        if (isNaN(num)) return '0.00';
        return num.toFixed(2);
    };

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
                        <option value="discount">Discount</option>
                    </select>
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="space-y-6">
                {filteredModels.map((model) => {
                    const discount = calculateDiscount(model.cost_our, model.cost_fal);
                    return (
                        <div key={model.id} className="group border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 -mx-4 px-4 rounded-xl transition-colors">
                            <Link href={`/models/${model.api_model_name}`} className="block">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {getProviderName(model.api_model_name)}: {model.name}
                                            </h3>
                                            <CopyModelId id={model.api_model_name} />
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 max-w-2xl">
                                            {model.description || "No description available."}
                                        </p>

                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            by <span className="underline decoration-dotted hover:text-gray-700 dark:hover:text-gray-200 transition-colors">{getProviderName(model.api_model_name)}</span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                                        <div className="grid grid-cols-3 gap-6 text-right items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Our Price</span>
                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                                                    ${formatPrice(model.cost_our)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Fal Price</span>
                                                <span className="text-lg font-medium text-gray-500 dark:text-gray-500 font-mono line-through decoration-gray-400/50">
                                                    ${formatPrice(model.cost_fal ?? model.cost_our)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider flex items-center gap-1">
                                                    Discount
                                                </span>
                                                {discount ? (
                                                    <span className="text-lg font-bold text-green-500 flex items-center gap-0.5 bg-green-50 dark:bg-green-900/20 px-1.5 rounded">
                                                        -{discount}% <ArrowDown className="h-3 w-3" />
                                                    </span>
                                                ) : (
                                                    <span className="text-lg font-medium text-gray-300 dark:text-gray-700">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )
                })}

                {filteredModels.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No models found matching "{query}"
                    </div>
                )}
            </div>
        </div>
    );
}
