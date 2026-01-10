import { useState, useEffect } from 'react'
import { X, Check, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyBonusProps {
    isOpen: boolean
    onClose: () => void
    streak: number // Current streak (1-7)
    lastClaimDate: string | null // ISO string
    onClaim: () => Promise<void>
}

// Rewards configuration
const REWARDS = [10, 15, 15, 20, 20, 25, 25]

export default function DailyBonus({ isOpen, onClose, streak, lastClaimDate, onClaim }: DailyBonusProps) {
    const [timeLeft, setTimeLeft] = useState('')

    // Timer Logic: Count down to midnight
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };
        const timer = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(timer);
    }, []);

    const isClaimedToday = () => {
        if (!lastClaimDate) return false
        const last = new Date(lastClaimDate)
        const now = new Date()
        return last.toDateString() === now.toDateString()
    }

    const claimedToday = isClaimedToday()
    const currentDayIndex = claimedToday ? streak - 1 : streak

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        key="panel"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-md bg-[#1c1c1e] text-white rounded-t-3xl sm:rounded-3xl p-6 pb-12 relative z-10"
                    >
                        {/* Handle Bar (Mobile) */}
                        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 absolute top-3 left-1/2 -translate-x-1/2" />

                        {/* Header */}
                        <div className="text-center mb-8 mt-2">
                            <h2 className="text-2xl font-bold mb-2">Монетки за вход</h2>
                            <p className="text-gray-400 text-sm px-6 leading-relaxed">
                                Заходите каждый день, чтобы собрать как можно больше монеток за неделю
                            </p>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {REWARDS.map((amount, index) => {
                                const dayNum = index + 1
                                const isToday = index === currentDayIndex

                                let state = 'locked'
                                if (index < streak) {
                                    state = 'collected'
                                } else if (index === streak && !claimedToday) {
                                    state = 'active'
                                }

                                return (
                                    <div
                                        key={index}
                                        onClick={() => state === 'active' ? onClaim() : null}
                                        className={`
                                            relative flex flex-col items-center justify-center rounded-2xl p-2 aspect-[4/5]
                                            transition-all duration-200
                                            ${state === 'active' ? 'bg-[#3a3a3c] scale-105 shadow-xl cursor-pointer ring-2 ring-white/10 hover:bg-[#4a4a4c]' : ''}
                                            ${state === 'collected' ? 'bg-[#2c2c2e]' : ''}
                                            ${state === 'locked' ? 'bg-[#2c2c2e] opacity-50' : ''}
                                            ${dayNum > 4 && index >= 4 ? 'col-span-1.3' : ''} 
                                        `}
                                        style={{
                                            gridColumn: index >= 4 ? 'auto' : 'auto'
                                        }}
                                    >
                                        {/* Day Label */}
                                        <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-white' : 'text-gray-500'}`}>
                                            {isToday ? 'Сегодня' : `${dayNum} день`}
                                        </span>

                                        {/* Coin/Check Circle/Active State */}
                                        {state === 'collected' ? (
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                                <Check className="w-6 h-6 text-white" />
                                            </div>
                                        ) : state === 'active' ? (
                                            /* Active Day Presentation */
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10 animate-pulse">
                                                <Coins className="w-6 h-6 text-black" />
                                            </div>
                                        ) : (
                                            /* Locked Day */
                                            <div className="w-10 h-10 bg-[#3a3a3c] rounded-full flex items-center justify-center shadow-lg relative z-10">
                                                <div className="font-black text-xs text-white/50">{amount}</div>
                                            </div>
                                        )}

                                        {/* Amount Value (Background/Behind) */}
                                        {state !== 'collected' && (
                                            <div className={`mt-2 font-black text-lg ${state === 'active' ? 'text-white' : 'text-gray-500'}`}>
                                                {amount}
                                            </div>
                                        )}
                                        {state === 'collected' && (
                                            <div className={`mt-2 font-black text-lg text-green-500 opacity-0`}>
                                                {amount}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <style jsx>{`
                            .grid-cols-4 {
                                display: flex;
                                flex-wrap: wrap;
                                justify-content: center;
                            }
                            .grid-cols-4 > div {
                                width: calc(25% - 0.75rem);
                                margin-bottom: 0.75rem;
                                min-width: 70px;
                            }
                        `}</style>

                        {/* Footer Action Panel */}
                        <div className="mt-4">
                            {!claimedToday ? (
                                <button
                                    onClick={() => onClaim()}
                                    className="w-full bg-gradient-to-r from-[#ff9500] to-[#ff5e00] text-white font-black text-xl py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <span>ЗАБРАТЬ</span>
                                </button>
                            ) : (
                                <div className="bg-[#2c2c2e] rounded-2xl py-3 px-4 flex flex-col items-center justify-center border border-white/5">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Новая награда через</span>
                                    <span className="text-lg font-mono font-bold text-white tracking-widest leading-none">{timeLeft}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
