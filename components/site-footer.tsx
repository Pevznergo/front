import Link from 'next/link';
import { Zap } from 'lucide-react';

export function SiteFooter() {
    return (
        <footer className="relative border-t border-white/[0.06] bg-carbon-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                    {/* Brand */}
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-carbon-900" strokeWidth={3} />
                        </div>
                        <span className="font-bold text-white text-xl">
                            Aporto
                        </span>
                    </Link>

                    <p className="text-sm text-carbon-400 mb-8 leading-relaxed">
                        The high-performance API Gateway for all AI applications.
                        Stop waiting for your LLM. Build faster.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-8 border-t border-white/[0.06] gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            All systems operational
                        </div>
                        <p className="text-xs text-carbon-500">
                            © {new Date().getFullYear()} Aporto.tech. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
