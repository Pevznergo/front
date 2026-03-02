'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Zap, Clock, Globe } from 'lucide-react';

function AnimatedCounter({ end, suffix, duration = 2000 }: { end: number; suffix: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
    {
        icon: Zap,
        value: 150000,
        suffix: '+',
        label: 'Requests Daily',
        description: 'Handling massive scale with sub-ms latency',
        color: 'from-neon-cyan to-neon-blue',
        iconColor: 'text-neon-cyan',
    },
    {
        icon: Clock,
        value: 5,
        suffix: 'x',
        label: 'Faster TTFT',
        description: 'Time-To-First-Token acceleration',
        color: 'from-neon-blue to-neon-purple',
        iconColor: 'text-neon-blue',
    },
    {
        icon: Globe,
        value: 50,
        suffix: '+',
        label: 'AI Providers',
        description: 'Integrated models from all major providers',
        color: 'from-neon-purple to-pink-500',
        iconColor: 'text-neon-purple',
    },
];

export function StatsSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Subtle divider line */}
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
                        Built for <span className="gradient-text">Scale</span>
                    </h2>
                    <p className="text-carbon-300 max-w-lg mx-auto">
                        Infrastructure that grows with your ambitions. No compromises.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="glass-card-hover p-8 text-center group"
                        >
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 mb-5`}
                                style={{ background: `linear-gradient(135deg, rgba(0,229,255,0.1), rgba(41,121,255,0.1))` }}
                            >
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm font-semibold text-carbon-200 mb-1">{stat.label}</div>
                            <div className="text-xs text-carbon-400">{stat.description}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
