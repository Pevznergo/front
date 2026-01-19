'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Image as ImageIcon, Mic, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure utils exist or use clsx

// Helper for bento items
const BentoItem = ({
    className,
    title,
    description,
    icon: Icon,
    delay = 0
}: {
    className?: string,
    title: string,
    description: string,
    icon: any,
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className={cn(
            "rounded-[2rem] p-8 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300",
            className
        )}
    >
        <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center mb-6 z-10 text-slate-900">
            <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 z-10 relative">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed z-10 relative">{description}</p>

        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-100 group-hover:opacity-90 transition-opacity" />
    </motion.div>
);

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-[#F2F2F7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                            Больше, чем просто чат.
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Мы объединили лучшие нейросети в одном удобном интерфейсе Telegram.
                        </p>
                    </motion.div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">

                    {/* Feature 1: Main (Context) - Tall */}
                    <BentoItem
                        className="md:col-span-1 md:row-span-2 bg-white"
                        title="Помнит контекст"
                        description="Ведите естественный диалог. Бот помнит историю переписки и понимает уточняющие вопросы."
                        icon={BrainCircuit}
                    />

                    {/* Feature 2: Wide (Models) */}
                    <div className="md:col-span-2 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-[2rem] p-8 relative overflow-hidden text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-500/20">
                        <div className="flex-1 z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">GPT-4o & Claude 3.5 Sonnet</h3>
                            <p className="text-blue-100 font-medium leading-relaxed max-w-md">
                                Переключайтесь между самыми мощными моделями мира в один клик. Идеально для кода, текстов и анализа.
                            </p>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Feature 3: Image Gen */}
                    <BentoItem
                        className="md:col-span-1 bg-white"
                        title="Генерация изображений"
                        description="DALL-E 3 и Midjourney (soon). Создавайте уникальные арты по простому описанию."
                        icon={ImageIcon}
                        delay={0.1}
                    />

                    {/* Feature 4: Voice */}
                    <BentoItem
                        className="md:col-span-1 bg-white"
                        title="Голосовое управление"
                        description="Лень писать? Отправьте голосовое — бот расшифрует его и ответит текстом или голосом."
                        icon={Mic}
                        delay={0.2}
                    />

                </div>
            </div>
        </section>
    );
}
