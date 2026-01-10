'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

// Reuse Prize interface (should normally be in a types file)
interface Prize {
    id: number
    name: string
    type: string
    value: string
    image_url?: string
}

interface WinModalProps {
    prize: Prize
    onClose: () => void
}

export default function WinModal({ prize, onClose }: WinModalProps) {
    // Determine visuals based on prize type
    const isCoupon = prize.type === 'coupon'

    // Simulate a 24h timer decreasing
    const [timer, setTimer] = useState("23:59:12")

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm aspect-[9/16] max-h-[90vh] bg-gradient-to-b from-[#8B4513] to-[#4A2511] rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center text-center p-6 border-4 border-[#A0522D]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Light Bursts Background Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_10deg,transparent_20deg,rgba(255,255,255,0.1)_30deg,transparent_40deg,rgba(255,255,255,0.1)_50deg,transparent_60deg)] animate-[spin_20s_linear_infinite]" />
                </div>

                {/* Main Visual Composition */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full mt-4">

                    {/* Stars / Sparkles decorations */}
                    <div className="absolute top-10 right-0 animate-pulse text-yellow-400">
                        <Sparkles className="w-12 h-12 fill-current" />
                    </div>
                    <div className="absolute bottom-20 left-4 animate-pulse delay-75 text-yellow-400">
                        <Sparkles className="w-8 h-8 fill-current" />
                    </div>

                    {/* Prize Visual */}
                    {isCoupon ? (
                        <div className="relative transform rotate-[-6deg] mb-8">
                            <div className="bg-[#3b82f6] w-64 h-32 rounded-3xl shadow-xl flex items-center justify-center border-b-8 border-b-blue-700 relative overflow-hidden">
                                {/* Pseudo-3D Ticket cutout */}
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#8B4513] rounded-full" />
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#8B4513] rounded-full" />

                                <span className="font-black text-white text-7xl drop-shadow-lg italic">{prize.value}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative mb-8">
                            {/* Generic Money/Prize Visual */}
                            <div className="bg-green-500 w-48 h-48 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20">
                                <span className="font-black text-white text-5xl">{prize.value}</span>
                            </div>
                        </div>
                    )}

                    {/* Timer Badge */}
                    <div className="inline-block px-4 py-1 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm mb-4">
                        <span className="font-mono text-white text-sm font-medium tracking-widest">{timer}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-2xl font-bold leading-tight mb-2">
                        {isCoupon
                            ? `Скидка ${prize.value.replace('-', '')} на товары`
                            : `Вы выиграли ${prize.name}!`}
                    </h2>

                    {/* Description */}
                    <p className="text-white/70 text-sm px-4 leading-relaxed">
                        Уже применилась к цене, сгорит через 24 часа
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="w-full relative z-20 pb-4">
                    <button
                        onClick={onClose} // Navigate to goods logic would go here
                        className="w-full bg-[#FFE600] text-black font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mb-4"
                    >
                        К товарам
                    </button>

                    <button className="text-white/50 text-xs underline hover:text-white transition-colors">
                        Условия акции
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
