export function StatsSection() {
    return (
        <section className="py-12 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">30T</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Tokens</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">5M+</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Global Users</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">60+</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Active Providers</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 text-blue-600">300+</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Models</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
