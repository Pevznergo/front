'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Resolve AI
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        <Link href="#use-cases" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Use Cases
                        </Link>
                        <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            How it Works
                        </Link>
                        <Link href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Pricing
                        </Link>
                    </nav>

                    <div>
                        <Link
                            href={session ? "/dashboard" : "/login"}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#007AFF] hover:bg-[#006ee6] transition-colors shadow-sm"
                        >
                            {session ? "Dashboard" : "Start Risk-Free"}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
