'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Model {
    id: number;
    name: string;
    api_model_name: string;
}

export function HeaderSearch() {
    const [query, setQuery] = useState('');
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [filteredModels, setFilteredModels] = useState<Model[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch models once on mount
        async function fetchModels() {
            try {
                const res = await fetch('/api/models');
                if (res.ok) {
                    const data = await res.json();
                    setAllModels(data);
                    setFilteredModels(data);
                }
            } catch (e) {
                console.error("Failed to fetch models for search", e);
            }
        }
        fetchModels();
    }, []);

    useEffect(() => {
        // Filter models when query changes
        const lower = query.toLowerCase();
        const filtered = allModels.filter(m =>
            m.name.toLowerCase().includes(lower) ||
            m.api_model_name.toLowerCase().includes(lower)
        );
        setFilteredModels(filtered);
    }, [query, allModels]);

    useEffect(() => {
        // Click outside to close
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (apiModelName: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(`/models/${apiModelName}`);
    };

    return (
        <div className="relative w-64" ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="bg-gray-100 dark:bg-gray-800 text-sm rounded-md pl-9 pr-4 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    placeholder="Search models..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs">/</span>
                </div>
            </div>

            {isOpen && filteredModels.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 max-h-60 overflow-y-auto z-50">
                    {/* Limit height for scrolling, approx 5 items */}
                    <ul className="py-1">
                        {filteredModels.map((model) => (
                            <li key={model.id}>
                                <button
                                    onClick={() => handleSelect(model.api_model_name)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <div className="font-medium truncate">{model.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{model.api_model_name}</div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
