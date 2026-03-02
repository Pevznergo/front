'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export const openWaitlistModal = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openWaitlistModal'));
    }
};

export function WaitlistModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setStatus('idle');
            setEmail('');
            setMessage('');
        };
        window.addEventListener('openWaitlistModal', handleOpen);
        return () => window.removeEventListener('openWaitlistModal', handleOpen);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('You have been added to the waitlist! We will contact you soon.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to join waitlist. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again later.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-carbon-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-carbon-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative top gradient */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple" />

                            {/* Close button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-carbon-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neon-cyan">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center text-white mb-2">
                                    Get Early Access
                                </h3>
                                <p className="text-center text-carbon-400 text-sm mb-8">
                                    Join the waitlist to be among the first to experience Aporto's high-speed AI Gateway.
                                </p>

                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                        <p className="text-emerald-400 font-medium">
                                            {message}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-carbon-500" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email address"
                                                className="w-full bg-carbon-800 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-carbon-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                                                required
                                                disabled={status === 'loading'}
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="flex items-start gap-2 text-rose-400 text-sm mt-2">
                                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                <p>{message}</p>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className={`w-full btn-neon py-3 flex justify-center items-center gap-2 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {status === 'loading' ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Join Waitlist'
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
