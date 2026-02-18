import { Search } from 'lucide-react';

export function SearchBar() {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm"
                placeholder="Search models..."
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">/</span>
            </div>
        </div>
    );
}
