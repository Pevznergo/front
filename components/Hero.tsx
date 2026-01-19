'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, Mic, Image as ImageIcon, Sparkles, Send } from 'lucide-react';

export default function Hero() {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string | React.ReactNode }>>([
        { role: 'assistant', content: 'Привет! Я Aporto AI. Чем могу помочь?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, isTyping]);

    // Simulated interaction
    useEffect(() => {
        const timer = setTimeout(() => {
            simulateConversation();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const simulateConversation = async () => {
        // Step 1: User asks
        await wait(1000);
        setIsTyping(true); // User typing
        await wait(1500);
        setMessages(prev => [...prev, { role: 'user', content: 'Нарисуй футуристичный город в неоновом стиле' }]);
        setIsTyping(false);

        // Step 2: AI Thinking
        await wait(500);
        setIsTyping(true); // AI thinking
        await wait(2000);

        // Step 3: AI Response (Image placeholder)
        setIsTyping(false);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: (
                <div className="flex flex-col gap-2">
                    <span>Готово! Вот что получилось:</span>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 shadow-sm animate-pulse">
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 font-medium text-xs">
                            Generated Image
                        </div>
                    </div>
                </div>
            )
        }]);
    };

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
                                <Sparkles className="w-3 h-3" />
                                <span>GPT-4o & Claude 3.5</span>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                                Ваш персональный <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#5856D6]">ИИ-ассистент</span> в Telegram.
                            </h1>

                            <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                                Мгновенные ответы, генерация изображений и поиск информации. Работает без VPN и сложных настроек прямо в вашем мессенджере.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://t.me/Aporto_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-[#007AFF] hover:bg-[#006ee6] border border-transparent rounded-full shadow-lg hover:shadow-blue-500/30 active:scale-95"
                                >
                                    Запустить бесплатно
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </a>
                                <div className="flex items-center gap-4 px-4 py-2 text-sm font-semibold text-slate-500">
                                    <span>🔥 Уже используют &gt; 10,000</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Chat Demo */}
                    <div className="relative w-full perspective-1000">
                        {/* Gradient Blur */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/30 to-purple-400/30 blur-3xl rounded-full opacity-60 pointer-events-none transform scale-110" />

                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden min-h-[500px] flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">Aporto AI</div>
                                        <div className="text-[10px] text-blue-500 font-medium">bot</div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    Telegram Web App
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`
                                            max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm
                                            ${msg.role === 'user'
                                                ? 'bg-[#007AFF] text-white rounded-tr-sm'
                                                : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'}
                                        `}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area (Visual only) */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="bg-slate-100 rounded-[1.5rem] px-4 py-2 flex items-center gap-3">
                                    <div className="p-2 text-slate-400">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 text-sm text-slate-400 font-medium">
                                        Message...
                                    </div>
                                    <div className="p-2 text-slate-400">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <div className="p-2 bg-[#007AFF] rounded-full text-white">
                                        <Send className="w-4 h-4 translate-x-px translate-y-px" />
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
