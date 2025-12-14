'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Lock, Terminal, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    // 0: Input
    // 1: Connecting
    // 2: Scrape/Fetch
    // 3: Semantics
    // 4: Policy Check
    // 5: Strategy
    // 6: Result
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setStep(1); // Connecting...

        // Organic simulation sequence
        setTimeout(() => setStep(2), 1500);  // Fetching metadata
        setTimeout(() => setStep(3), 3800);  // Analyzing semantics
        setTimeout(() => setStep(4), 6500);  // Cross-referencing policies
        setTimeout(() => setStep(5), 9000);  // Generating strategy
        setTimeout(() => setStep(6), 11500); // Final Result

        try {
            await fetch('/api/submit-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: inputValue })
            });
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-[#F2F2F7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Column: Text */}
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
                                <Shield className="w-3 h-3" />
                                <span>AI Legal Defense</span>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                                Delete Unfair Reviews with <span className="text-[#007AFF]">AI Legal Precision.</span>
                            </h1>

                            <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                                Our agent audits reviews against platform policies, submits instant appeals, and drafts formal demand letters if needed.
                            </p>

                            <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Google Maps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Yelp</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Glassdoor</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Interactive Console */}
                    <div className="relative w-full perspective-1000">
                        {/* Gradient Blur */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/30 to-indigo-400/30 blur-3xl rounded-full opacity-60 pointer-events-none transform scale-110" />

                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden min-h-[480px] flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md z-20">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-black/80">Analysis Console</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {step === 0 && <span className="text-[10px] uppercase font-bold text-slate-400">Ready</span>}
                                    {step > 0 && step < 6 && <span className="text-[10px] uppercase font-bold text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>}
                                    {step === 6 && <span className="text-[10px] uppercase font-bold text-green-500">Complete</span>}
                                    <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center">
                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-6 flex-1 flex flex-col relative">

                                {/* State 0: Input Form */}
                                <AnimatePresence mode="wait">
                                    {step === 0 && (
                                        <motion.div
                                            key="input"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                            className="flex flex-col h-full justify-center"
                                        >
                                            <form onSubmit={handleAnalyze} className="w-full">
                                                <label className="block text-sm font-semibold text-slate-700 mb-4 ml-1">
                                                    Paste review link or text
                                                </label>
                                                <div className={`relative bg-white rounded-[1.5rem] border transition-all duration-300 shadow-sm overflow-hidden group ${isFocused ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
                                                    <textarea
                                                        value={inputValue}
                                                        onChange={(e) => setInputValue(e.target.value)}
                                                        onFocus={() => setIsFocused(true)}
                                                        onBlur={() => setIsFocused(false)}
                                                        placeholder="e.g., https://goo.gl/maps/... or &quot;This business is a scam...&quot;"
                                                        className="w-full p-5 min-h-[140px] outline-none text-slate-700 placeholder:text-slate-400 resize-none bg-transparent font-medium"
                                                    />
                                                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                                        <div className="text-xs text-slate-400 font-medium px-2">
                                                            Strictly Confidential
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={!inputValue.trim()}
                                                            className="bg-[#007AFF] hover:bg-[#006ee6] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                                                        >
                                                            Analyze Review
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    {/* State: Processing (1, 2, 3) */}
                                    {step > 0 && (
                                        <motion.div
                                            key="processing"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 p-6 flex flex-col font-sans pointer-events-none"
                                        >
                                            {/* Replicating the iOS User Bubble */}
                                            <div className="flex justify-end mb-6">
                                                <div className="bg-[#007AFF] text-white px-5 py-3 rounded-[1.2rem] rounded-tr-sm shadow-sm max-w-[85%]">
                                                    <p className="text-[15px] leading-relaxed line-clamp-2">
                                                        Analyzing: <span className="opacity-90 italic">"{inputValue}"</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Agent Response Container */}
                                            <div className="w-full">
                                                <AnimatePresence>
                                                    {step >= 1 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            className="bg-slate-100/80 backdrop-blur-md border border-white/50 p-4 rounded-[1.2rem] rounded-tl-sm w-full shadow-sm"
                                                        >
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                                                                    <Terminal className="w-4 h-4 text-white" />
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-900">Aporto Agent</span>
                                                            </div>

                                                            <div className="space-y-3 font-mono text-xs text-slate-600">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                                    Establishing secure connection...
                                                                </div>

                                                                {step >= 2 && (
                                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                        Fetching platform metadata...
                                                                    </motion.div>
                                                                )}

                                                                {step >= 3 && (
                                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                                        Analyzing linguistic patterns...
                                                                    </motion.div>
                                                                )}

                                                                {step >= 4 && (
                                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                                        Cross-referencing Policy Database v4.2...
                                                                    </motion.div>
                                                                )}

                                                                {step >= 5 && (
                                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 font-bold text-slate-800">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                        Drafting optimal removal strategy...
                                                                    </motion.div>
                                                                )}

                                                                {step >= 6 && (
                                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 font-bold text-slate-800 pt-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                                        Violation detected: <span className="blur-sm bg-slate-200 text-transparent select-none rounded ml-1">"Conflict of Interest"</span>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Result Card */}
                                            <AnimatePresence>
                                                {step >= 6 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-auto pointer-events-auto"
                                                    >
                                                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[1.5rem] p-5 shadow-lg relative overflow-hidden group">
                                                            <div className="flex items-center justify-between mb-3 relative z-10">
                                                                <div>
                                                                    <h4 className="text-slate-900 font-bold text-lg tracking-tight">Check Probability of Removal</h4>
                                                                    <p className="text-slate-500 text-sm font-medium">Drafting appeal strategy...</p>
                                                                </div>
                                                                <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center shadow-lg shadow-green-500/30">
                                                                    <CheckCircle className="w-6 h-6 text-white" />
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => router.push('/login')}
                                                                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 rounded-[1rem] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
                                                            >
                                                                Start Application
                                                                <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </motion.div>

                    </div>

                </div>
            </div>
        </section>
    );
}
