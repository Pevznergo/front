'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, ChevronRight, Loader2 } from 'lucide-react'

interface Prize {
    id: number
    name: string
    description?: string
    type: string
    value: string
    image_url?: string
    code?: string // For user prizes
    expiry_date?: string // For user prizes
}

interface PrizesModalProps {
    isOpen: boolean
    onClose: () => void
    initData: string
}

export default function PrizesModal({ isOpen, onClose, initData }: PrizesModalProps) {
    const [activeTab, setActiveTab] = useState<'won' | 'all'>('won')
    const [wonPrizes, setWonPrizes] = useState<Prize[]>([])
    const [allPrizes, setAllPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && initData) {
            setLoading(true)
            fetch(`/api/webapp/prizes?initData=${encodeURIComponent(initData)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.won) setWonPrizes(data.won)
                    if (data.available) setAllPrizes(data.available)
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
    }, [isOpen, initData])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-[#1c1c1e] text-white overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 pt-6 bg-[#1c1c1e] z-10">
                        <h2 className="text-2xl font-bold">Призы</h2>
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 mx-4 bg-[#2c2c2e] rounded-xl mb-6">
                        <button
                            onClick={() => setActiveTab('won')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'won' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Вы выиграли
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'all' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-gray-400'
                                }`}
                        >
                            Можно выиграть
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 pb-20">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin w-8 h-8 text-white/50" />
                            </div>
                        ) : activeTab === 'won' ? (
                            <div className="space-y-4">
                                {wonPrizes.length === 0 ? (
                                    <div className="text-center text-gray-500 py-10">
                                        <p>У вас пока нет призов.</p>
                                        <p className="text-sm mt-1">Крутите колесо, чтобы выиграть!</p>
                                    </div>
                                ) : (
                                    wonPrizes.map((prize, idx) => (
                                        <WonPrizeCard key={idx} prize={prize} />
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {allPrizes.map((prize) => (
                                    <AllPrizeCard key={prize.id} prize={prize} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}

function WonPrizeCard({ prize }: { prize: Prize }) {
    const isCoupon = prize.type === 'coupon'
    return (
        <div className="bg-[#2c2c2e] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex gap-4">
                {/* Visual Placeholder if no image */}
                <div className="w-16 h-16 bg-[#3a3a3c] rounded-xl flex-shrink-0 flex items-center justify-center">
                    {isCoupon ? (
                        <span className="font-black text-blue-400 text-xs">{prize.value}</span>
                    ) : (
                        <GiftIcon type={prize.type} />
                    )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-sm leading-tight mb-1">{prize.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{prize.description || 'Действует 24 часа'}</p>
                </div>
            </div>

            {isCoupon && prize.code && (
                <div className="flex gap-2">
                    <div className="flex-1 bg-[#3a3a3c] h-10 rounded-lg flex items-center px-3 text-xs font-mono text-gray-300">
                        {prize.code}
                    </div>
                    <button className="h-10 px-4 bg-[#FFE600] rounded-lg text-black font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform">
                        К товарам
                    </button>
                </div>
            )}
            {!isCoupon && (
                <button className="w-full h-10 bg-[#FFE600] rounded-lg text-black font-bold text-sm active:scale-95 transition-transform">
                    К товарам
                </button>
            )}
        </div>
    )
}

function AllPrizeCard({ prize }: { prize: Prize }) {
    return (
        <div className="bg-[#2c2c2e] rounded-2xl p-4 flex flex-col items-center text-center gap-2 aspect-[4/5] justify-center">
            <div className="w-20 h-20 bg-[#3a3a3c] rounded-full flex items-center justify-center mb-2">
                <GiftIcon type={prize.type} />
            </div>
            <p className="font-bold text-xs leading-tight">{prize.name}</p>
        </div>
    )
}

function GiftIcon({ type }: { type: string }) {
    // Determine icon based on type/name heuristics
    return <div className="text-2xl">🎁</div>
}
