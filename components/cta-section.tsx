'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function CTASection() {
    return (
        <section className="relative py-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Background effects */}
            <div className="absolute inset-0 grid-pattern opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-neon-cyan/[0.08] via-neon-blue/[0.03] to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 mb-8 neon-box-glow">
                        <Zap className="w-8 h-8 text-neon-cyan" />
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to{' '}
                        <span className="gradient-text">supercharge</span>
                        <br />
                        your API calls?
                    </h2>

                    <p className="text-lg text-carbon-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of developers building faster AI applications.
                        Get started in under 2 minutes with our OpenAI-compatible API.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent('openWaitlistModal'));
                            }}
                            className="btn-neon flex items-center justify-center gap-2 group text-base px-10 py-4 w-full sm:w-auto"
                        >
                            Get Early Access
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Bottom note */}
                    <p className="mt-8 text-xs text-carbon-500">
                        Join the waitlist or start right away via the Telegram bot.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
