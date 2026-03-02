'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';

// Animated live latency graph
function LatencyGraph() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const dataRef = useRef<number[]>([]);
    const throughputRef = useRef<number[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = 560;
        const h = 280;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        // Init data
        for (let i = 0; i < 80; i++) {
            dataRef.current.push(0.3 + Math.random() * 0.15);
            throughputRef.current.push(0.5 + Math.random() * 0.3);
        }

        let time = 0;

        function draw() {
            if (!ctx) return;
            time += 0.02;

            // Push new points
            dataRef.current.shift();
            dataRef.current.push(0.25 + Math.sin(time * 1.5) * 0.08 + Math.random() * 0.06);

            throughputRef.current.shift();
            throughputRef.current.push(0.55 + Math.sin(time * 0.8 + 1) * 0.15 + Math.random() * 0.08);

            // Clear
            ctx.clearRect(0, 0, w, h);

            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const y = (h / 6) * i + 20;
                ctx.beginPath();
                ctx.moveTo(40, y);
                ctx.lineTo(w - 20, y);
                ctx.stroke();
            }
            for (let i = 0; i < 8; i++) {
                const x = 40 + ((w - 60) / 8) * i;
                ctx.beginPath();
                ctx.moveTo(x, 20);
                ctx.lineTo(x, h - 20);
                ctx.stroke();
            }

            // Y-axis labels
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'right';
            const labels = ['0ms', '2ms', '4ms', '6ms', '8ms'];
            labels.forEach((label, i) => {
                ctx.fillText(label, 36, h - 20 - (i * (h - 40) / (labels.length - 1)) + 3);
            });

            // Throughput area (behind)
            const grad2 = ctx.createLinearGradient(0, 0, 0, h);
            grad2.addColorStop(0, 'rgba(124, 77, 255, 0.15)');
            grad2.addColorStop(1, 'rgba(124, 77, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(40, h - 20);
            throughputRef.current.forEach((v, i) => {
                const x = 40 + (i / (throughputRef.current.length - 1)) * (w - 60);
                const y = h - 20 - v * (h - 40);
                if (i === 0) ctx.moveTo(x, h - 20);
                ctx.lineTo(x, y);
            });
            ctx.lineTo(w - 20, h - 20);
            ctx.closePath();
            ctx.fillStyle = grad2;
            ctx.fill();

            // Throughput line
            ctx.beginPath();
            throughputRef.current.forEach((v, i) => {
                const x = 40 + (i / (throughputRef.current.length - 1)) * (w - 60);
                const y = h - 20 - v * (h - 40);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.strokeStyle = 'rgba(124, 77, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Latency area
            const grad1 = ctx.createLinearGradient(0, 0, 0, h);
            grad1.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
            grad1.addColorStop(1, 'rgba(0, 229, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(40, h - 20);
            dataRef.current.forEach((v, i) => {
                const x = 40 + (i / (dataRef.current.length - 1)) * (w - 60);
                const y = h - 20 - v * (h - 40);
                if (i === 0) ctx.moveTo(x, h - 20);
                ctx.lineTo(x, y);
            });
            ctx.lineTo(w - 20, h - 20);
            ctx.closePath();
            ctx.fillStyle = grad1;
            ctx.fill();

            // Latency line
            ctx.beginPath();
            dataRef.current.forEach((v, i) => {
                const x = 40 + (i / (dataRef.current.length - 1)) * (w - 60);
                const y = h - 20 - v * (h - 40);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Glow dot on end
            const lastVal = dataRef.current[dataRef.current.length - 1];
            const dotX = w - 20;
            const dotY = h - 20 - lastVal * (h - 40);

            const dotGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 12);
            dotGlow.addColorStop(0, 'rgba(0, 229, 255, 0.8)');
            dotGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.fillStyle = dotGlow;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
            ctx.fill();

            animFrameRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    return (
        <div className="relative">
            <div className="glass-card p-4 rounded-2xl neon-box-glow">
                {/* Graph header */}
                <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-neon-cyan" />
                        <span className="text-xs font-medium text-carbon-200">Latency vs Throughput</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-neon-cyan"></div>
                            <span className="text-[10px] text-carbon-300">Latency</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-neon-purple"></div>
                            <span className="text-[10px] text-carbon-300">Throughput</span>
                        </div>
                    </div>
                </div>
                <canvas ref={canvasRef} className="w-full" />
                {/* Bottom live indicator */}
                <div className="flex items-center gap-2 mt-2 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] text-carbon-400">Live — Sub-millisecond routing active</span>
                </div>
            </div>
        </div>
    );
}

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 grid-pattern" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-neon-cyan/[0.07] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-radial from-neon-purple/[0.05] via-transparent to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-cyan/20 bg-neon-cyan/[0.05] mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-medium text-neon-cyan">Handling 150,000+ requests daily</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-white mb-6">
                            The Speed of Thought{' '}
                            <br />
                            <span className="gradient-text">for your AI Stack.</span>
                        </h1>

                        <p className="text-lg text-carbon-300 leading-relaxed mb-8 max-w-xl">
                            Sub-millisecond routing, 40% cost reduction, and zero-latency infrastructure.
                            Whether you build agents, chatbots, or enterprise RAG — we make it <span className="text-white font-medium">instant</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.dispatchEvent(new CustomEvent('openWaitlistModal'));
                                }}
                                className="btn-neon flex items-center justify-center gap-2 group w-full sm:w-auto"
                            >
                                Get Early Access
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        {/* Micro trust bar */}
                        <div className="mt-8 flex items-center gap-6 text-xs text-carbon-400">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                OpenAI compatible
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                No vendor lock-in
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                SOC 2 ready
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Live graph */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                        className="hidden lg:block"
                    >
                        <LatencyGraph />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
