import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Aporto
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Your unified interface for the best AI models.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/models" className="hover:text-blue-600 transition-colors">Models</Link></li>
                            <li><Link href="/docs" className="hover:text-blue-600 transition-colors">Docs</Link></li>
                            <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/about" className="hover:text-blue-600 transition-colors">About</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} Aporto. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {/* Social icons can go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
