'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { HeaderSearch } from './ui/header-search';
import {
    Activity,
    FileText,
    CreditCard,
    Settings,
    LogOut,
    User as UserIcon,
    Moon,
    Sun,
    Laptop
} from 'lucide-react';
import Image from 'next/image';

function UserDropdown({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const ADMIN_URL = "https://api.aporto.tech/client";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                        <UserIcon className="w-4 h-4" />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    <a href={`${ADMIN_URL}/dashboard`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Activity className="w-4 h-4" />
                        Activity
                    </a>
                    <a href={`${ADMIN_URL}/logs`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <FileText className="w-4 h-4" />
                        Logs
                    </a>
                    <a href={`${ADMIN_URL}/credits`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <CreditCard className="w-4 h-4" />
                        Credits
                    </a>
                    <a href={`${ADMIN_URL}/settings`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Settings className="w-4 h-4" />
                        Settings
                    </a>

                    <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>

                    {/* Theme Toggle Placeholder - implementation depends on ThemeProvider */}
                    <div className="mt-2 px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 shadow-sm"><Sun className="w-3 h-3" /></button>
                            <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700"><Moon className="w-3 h-3" /></button>
                            <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700"><Laptop className="w-3 h-3" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

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
                                    AportoTech
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

                            {session ? (
                                <UserDropdown user={session.user} />
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="https://api.aporto.tech/client"
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="https://api.aporto.tech/client"
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </nav>

                        {/* Mobile button if needed */}
                        <div className="md:hidden">
                            {session ? (
                                <UserDropdown user={session.user} />
                            ) : (
                                <Link
                                    href="https://api.aporto.tech/client"
                                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
                                >
                                    Sign Up
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header >
        </>
    );
}
