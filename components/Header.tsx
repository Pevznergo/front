'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { AuthModal } from './ui/auth-modal';
import { HeaderSearch } from './ui/header-search';

export default function Header() {
    const { data: session } = useSession();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                    OpenRouter
                                </span>
                            </Link>

                            {/* Search Bar - Client Component */}
                            <div className="hidden md:block ml-4 relative">
                                <HeaderSearch />
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/models" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                Models
                            </Link>
                            <Link href="/chat" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                Chat
                            </Link>
                            <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                Docs
                            </Link>

                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                            >
                                Sign Up
                            </button>
                        </nav>

                        {/* Mobile button if needed */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}
