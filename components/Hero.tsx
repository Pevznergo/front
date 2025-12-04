'use client'

import { sendGTMEvent } from '@/lib/gtm'

export default function Hero() {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
            </div>

            <div className="max-w-4xl mx-auto w-full text-center relative z-10">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight text-white mb-6">
                    The Ultimate Perks Stack for <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI & No-Code Communities</span>
                </h1>

                <h2 className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Empower your members with exclusive savings on the tools they use to build.
                    Unlock up to <span className="text-white font-bold">$1,200/year</span> in value per member on n8n, Bolt, Replit, Perplexity, and more.
                </h2>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={() => {
                            sendGTMEvent({ event: 'cta_click', location: 'hero', label: 'get_perks' })
                            window.dispatchEvent(new CustomEvent('openBookingModal'))
                        }}
                        className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-white/20"
                    >
                        Get Perks for Your Community
                    </button>
                    <p className="text-sm text-gray-500 font-medium">Trusted by top creators and Skool communities.</p>
                </div>
            </div>
        </section>
    )
}
