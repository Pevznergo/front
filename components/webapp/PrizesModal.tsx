"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, ExternalLink, Clock, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PrizesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initData: string;
}

interface PrizeItem {
    id: number;
    name: string;
    description: string;
    image_url?: string;
    type: 'points' | 'coupon' | 'physical' | 'status';
    value: string;
    // User specific fields
    user_prize_id?: number;
    won_at?: string;
    expiry_at?: string;
    promo_code?: string;
}

export default function PrizesModal({ isOpen, onClose, initData }: PrizesModalProps) {
    const [activeTab, setActiveTab] = useState<'won' | 'all'>('won');
    const [userPrizes, setUserPrizes] = useState<PrizeItem[]>([]);
    const [allPrizes, setAllPrizes] = useState<PrizeItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPrizes();
        }
    }, [isOpen]);

    const fetchPrizes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/webapp/user-prizes?initData=${encodeURIComponent(initData)}`);
            const data = await res.json();
            if (data.userPrizes) setUserPrizes(data.userPrizes);
            if (data.activePrizes) setAllPrizes(data.activePrizes);

            // Auto-switch to 'all' if no won prizes
            if ((!data.userPrizes || data.userPrizes.length === 0) && data.activePrizes?.length > 0) {
                setActiveTab('all');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format time left (24h - elapsed)
    const getTimeLeft = (expiry: string) => {
        // Implementation or just static "24h" for now as per design
        return "Действует 24 часа";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col bg-[#2e2e2e] text-white"
                // #2e2e2e matches the screenshot dark gray roughly
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 pb-2">
                        <h2 className="text-2xl font-bold">Призы</h2>
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-4 py-2 gap-4">
                        <button
                            onClick={() => setActiveTab('won')}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-sm font-semibold transition-colors relative",
                                activeTab === 'won' ? "bg-[#333] text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Вы выиграли
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-sm font-semibold transition-colors relative",
                                activeTab === 'all' ? "bg-[#333] text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Можно выиграть
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="animate-spin text-yellow-400">Loading...</div></div>
                        ) : activeTab === 'won' ? (
                            // List View for "You Won"
                            <div className="space-y-4">
                                {userPrizes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                            <Gift className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p>Вы пока ничего не выиграли</p>
                                    </div>
                                ) : (
                                    userPrizes.map((prize) => (
                                        <PrizeListItem key={prize.user_prize_id} prize={prize} />
                                    ))
                                )}
                            </div>
                        ) : (
                            // Grid View for "Can Win"
                            <div className="grid grid-cols-2 gap-4 pb-8">
                                {allPrizes.length === 0 ? (
                                    <div className="col-span-2 flex flex-col items-center justify-center h-48 text-zinc-500 space-y-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                            <Gift className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p>Призы пока не добавлены</p>
                                    </div>
                                ) : (
                                    allPrizes.map((prize) => (
                                        <PrizeGridItem key={prize.id} prize={prize} />
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Disclaimer */}
                    <div className="p-4 text-center mt-auto border-t border-white/5">
                        <a href="#" className="text-zinc-500 text-xs underline decoration-zinc-600">Условия акции</a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// "You Won" - List Item Style
function PrizeListItem({ prize }: { prize: PrizeItem }) {
    return (
        <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-[#333] rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    {prize.image_url ? (
                        <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <span className="text-yellow-400 font-black text-sm italic">{prize.value}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-sm leading-tight text-white line-clamp-2">{prize.name}</h3>
                    <p className="text-xs text-zinc-500">Действует 24 часа</p>
                </div>
            </div>

            <div className="flex gap-2">
                {prize.promo_code && (
                    <button className="bg-[#444] text-white px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-transform">
                        <Copy className="w-3.5 h-3.5" />
                        {prize.promo_code}
                    </button>
                )}

                <button className="flex-1 bg-yellow-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-yellow-300">
                    К товарам
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

// "Can Win" - Grid Item Style
function PrizeGridItem({ prize }: { prize: PrizeItem }) {
    return (
        <div className="flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
            <div className="w-full aspect-square bg-transparent flex items-center justify-center relative p-2">
                {/* Image Placeholder or Actual Image */}
                {/* Using text fallback for now if no image, but ideally this is an image */}
                {prize.image_url ? (
                    <img src={prize.image_url} alt={prize.name} className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                ) : (
                    // Fallback visual based on prize type
                    <div className={`w-full h-full rounded-2xl flex items-center justify-center ${prize.type === 'coupon' ? 'bg-purple-500 rotate-[-5deg]' :
                        prize.type === 'points' ? 'bg-orange-500 rotate-[5deg]' :
                            'bg-zinc-700'
                        }`}>
                        <span className="text-white font-black text-xl">{prize.value || prize.name}</span>
                    </div>
                )}
            </div>
            <div className="text-center">
                <h3 className="text-xs font-bold text-white leading-tight">{prize.name}</h3>
            </div>
        </div>
    )
}
