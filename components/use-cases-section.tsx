'use client';

import { motion } from 'framer-motion';
import { Bot, Mic, Building2, ArrowUpRight } from 'lucide-react';

const useCases = [
    {
        icon: Bot,
        title: 'For Agents',
        tagline: 'Autonomous AI at full speed',
        description: 'Fast loops for autonomous tasks. Your agents make decisions in milliseconds, not seconds. ReAct, chain-of-thought, tool-use — all without the latency tax.',
        features: ['Sub-5ms routing loops', 'Multi-model orchestration', 'Automatic retries'],
        gradient: 'from-neon-cyan/20 to-neon-cyan/5',
        borderGlow: 'hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]',
        iconBg: 'bg-neon-cyan/10',
        iconColor: 'text-neon-cyan',
    },
    {
        icon: Mic,
        title: 'For Voice',
        tagline: 'Zero awkward pauses',
        description: 'Real-time conversational AI without the uncomfortable silence. Stream responses fast enough for natural human-to-AI voice interactions.',
        features: ['<200ms TTFT', 'Streaming-first architecture', 'Voice-optimized models'],
        gradient: 'from-neon-blue/20 to-neon-blue/5',
        borderGlow: 'hover:shadow-[0_0_30px_rgba(41,121,255,0.1)]',
        iconBg: 'bg-neon-blue/10',
        iconColor: 'text-neon-blue',
    },
    {
        icon: Building2,
        title: 'For Enterprise',
        tagline: 'Secure. Compliant. Cached.',
        description: 'Secure, PII-stripped, and cached queries for massive scale. Deploy with confidence across regulated industries with full audit trails.',
        features: ['PII redaction built-in', 'SOC 2 compliance', 'Semantic caching layer'],
        gradient: 'from-neon-purple/20 to-neon-purple/5',
        borderGlow: 'hover:shadow-[0_0_30px_rgba(124,77,255,0.1)]',
        iconBg: 'bg-neon-purple/10',
        iconColor: 'text-neon-purple',
    },
];

export function UseCasesSection() {
    return (
        <section id="use-cases" className="relative py-24 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        One Gateway. <span className="gradient-text">Every Use Case.</span>
                    </h2>
                    <p className="text-carbon-300 max-w-lg mx-auto">
                        Purpose-built routing for the way you actually use AI.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={uc.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`glass-card p-8 transition-all duration-500 group cursor-default ${uc.borderGlow}`}
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${uc.iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                                <uc.icon className={`w-6 h-6 ${uc.iconColor}`} />
                            </div>

                            {/* Title */}
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">{uc.title}</h3>
                                <ArrowUpRight className="w-4 h-4 text-carbon-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-white" />
                            </div>
                            <p className="text-sm font-medium text-neon-cyan/80 mb-3">{uc.tagline}</p>
                            <p className="text-sm text-carbon-300 leading-relaxed mb-5">{uc.description}</p>

                            {/* Features list */}
                            <ul className="space-y-2">
                                {uc.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-carbon-400">
                                        <div className="w-1 h-1 rounded-full bg-neon-cyan/60" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
