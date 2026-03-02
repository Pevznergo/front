'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-carbon-900/90 backdrop-blur-xl border-b border-white/[0.06]'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center transition-shadow duration-300 group-hover:shadow-neon">
                            <Zap className="w-4 h-4 text-carbon-900" strokeWidth={3} />
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">
                            Aporto
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8"></nav>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent('openWaitlistModal'));
                            }}
                            className="btn-neon !px-5 !py-2 text-sm"
                        >
                            Early Access
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden text-white/70 hover:text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/[0.06] animate-slide-down">
                        <nav className="flex flex-col gap-3">
                            <div className="pt-3 flex flex-col gap-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.dispatchEvent(new CustomEvent('openWaitlistModal'));
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="btn-neon text-center text-sm w-full"
                                >
                                    Early Access
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
