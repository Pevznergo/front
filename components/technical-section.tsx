'use client';

import { motion } from 'framer-motion';
import { Route, Database, RefreshCw, ChevronRight } from 'lucide-react';

const features = [
    {
        icon: Route,
        badge: '<5ms',
        title: 'Diffusion-Powered Routing',
        description: 'Our smart routing engine analyzes your prompt and selects the optimal model in under 5 milliseconds. Cost, latency, capability — all weighed in real-time.',
        details: [
            { label: 'Model Selection', value: '<5ms' },
            { label: 'Accuracy', value: '99.7%' },
            { label: 'Models Evaluated', value: '50+' },
        ],
        codeSnippet: `// Automatic model selection
const response = await aporto.chat({
  messages: [{ role: "user", content: prompt }],
  routing: "optimal", // cost + speed + quality
});
// → Routed to gpt-4o in 2.3ms`,
        accentColor: 'cyan',
    },
    {
        icon: Database,
        badge: '0ms',
        title: 'Tier 0 Cache',
        description: 'Instant delivery for repetitive queries. Our semantic caching layer identifies similar prompts and serves cached responses with zero latency, cutting costs by up to 40%.',
        details: [
            { label: 'Cache Hit Rate', value: '~35%' },
            { label: 'Response Time', value: '0ms' },
            { label: 'Cost Saving', value: '40%' },
        ],
        codeSnippet: `// Semantic cache in action
const res = await aporto.chat({
  messages: [{ role: "user", content: query }],
  cache: { semantic: true, ttl: 3600 },
});
// → Cache HIT: 0ms, $0.00`,
        accentColor: 'blue',
    },
    {
        icon: RefreshCw,
        badge: 'Auto',
        title: 'Auto-Failover',
        description: 'If OpenAI is slow, we switch to Groq or Anthropic instantly. Zero downtime, zero config. Your users never notice a thing while you maintain perfect uptime.',
        details: [
            { label: 'Failover Time', value: '<100ms' },
            { label: 'Uptime SLA', value: '99.99%' },
            { label: 'Providers', value: '50+' },
        ],
        codeSnippet: `// Automatic failover — zero config
const res = await aporto.chat({
  messages: [{ role: "user", content: input }],
  fallback: ["openai", "groq", "anthropic"],
});
// OpenAI timeout → Groq in 47ms`,
        accentColor: 'purple',
    },
];

const accentMap: Record<string, { text: string; bg: string; border: string; shadow: string }> = {
    cyan: {
        text: 'text-neon-cyan',
        bg: 'bg-neon-cyan/10',
        border: 'border-neon-cyan/20',
        shadow: 'shadow-[0_0_30px_rgba(0,229,255,0.08)]',
    },
    blue: {
        text: 'text-neon-blue',
        bg: 'bg-neon-blue/10',
        border: 'border-neon-blue/20',
        shadow: 'shadow-[0_0_30px_rgba(41,121,255,0.08)]',
    },
    purple: {
        text: 'text-neon-purple',
        bg: 'bg-neon-purple/10',
        border: 'border-neon-purple/20',
        shadow: 'shadow-[0_0_30px_rgba(124,77,255,0.08)]',
    },
};

export function TechnicalSection() {
    return (
        <section id="features" className="relative py-24 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-neon-blue/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-4 text-xs font-medium text-carbon-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                        Engineering Deep-Dive
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Technical <span className="gradient-text">Excellence</span>
                    </h2>
                    <p className="text-carbon-300 max-w-xl mx-auto">
                        Every millisecond matters. Here&apos;s how we engineer performance at the edge.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {features.map((feature, i) => {
                        const accent = accentMap[feature.accentColor];
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`glass-card p-8 lg:p-10 transition-all duration-500 hover:bg-white/[0.06] ${accent.shadow}`}
                            >
                                <div className="grid lg:grid-cols-2 gap-8 items-start">
                                    {/* Left: Description */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center`}>
                                                <feature.icon className={`w-5 h-5 ${accent.text}`} />
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${accent.bg} ${accent.text} border ${accent.border}`}>
                                                {feature.badge}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-carbon-300 leading-relaxed mb-6">{feature.description}</p>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {feature.details.map((d) => (
                                                <div key={d.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                                    <div className={`text-lg font-bold ${accent.text}`}>{d.value}</div>
                                                    <div className="text-[10px] text-carbon-400 mt-0.5">{d.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Code snippet */}
                                    <div className="rounded-xl bg-carbon-900/80 border border-white/[0.06] overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                                            <span className="ml-2 text-[10px] text-carbon-500">example.ts</span>
                                        </div>
                                        <pre className="p-5 text-xs leading-relaxed overflow-x-auto">
                                            <code className="text-carbon-200">
                                                {feature.codeSnippet}
                                            </code>
                                        </pre>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
