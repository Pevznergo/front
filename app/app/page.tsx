'use client'

import { useEffect, useState } from 'react'
import SlotMachine from '@/components/webapp/SlotMachine'
import DailyBonus from '@/components/webapp/DailyBonus'
import { Loader2, Gift, Target, Coins } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import WinModal from '@/components/webapp/WinModal'
import PrizesModal from '@/components/webapp/PrizesModal'

// Define types locally for now
interface Prize {
    id: number
    name: string
    probability: string
    type: string
    value: string
    image_url?: string
}

interface UserData {
    telegram_id: number | string
    first_name: string
    points: number
}

export default function WebAppPage() {
    const [initData, setInitData] = useState<string>('')
    const [user, setUser] = useState<UserData | null>(null)
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(true)
    const [spinning, setSpinning] = useState(false)
    const [winIndex, setWinIndex] = useState<number | null>(null)
    const [winResult, setWinResult] = useState<Prize | null>(null)
    const [isPrizesOpen, setIsPrizesOpen] = useState(false)

    // Daily Bonus State
    const [isDailyOpen, setIsDailyOpen] = useState(false);
    const [dailyStreak, setDailyStreak] = useState(1);
    const [lastDailyDate, setLastDailyDate] = useState<string | null>(null); // ISO date
    const [isDailyAvailable, setIsDailyAvailable] = useState(false);

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        // Initialize WebApp (Visuals Only)
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            const tg = (window as any).Telegram.WebApp
            tg.ready()
            tg.expand() // Fullscreen
            tg.setHeaderColor('#FF4500'); // Orange header

            const rawInitData = tg.initData
            setInitData(rawInitData)

            // RESTORED AUTH: Attempt to get real user data
            fetch('/api/webapp/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData: rawInitData })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user)
                        setDailyStreak(data.user.daily_streak || 1)
                        setLastDailyDate(data.user.last_daily_claim)

                        // Check availability
                        if (!data.user.last_daily_claim) {
                            setIsDailyAvailable(true)
                        } else {
                            const last = new Date(data.user.last_daily_claim).toDateString()
                            const today = new Date().toDateString()
                            setIsDailyAvailable(last !== today)
                        }
                    }
                })
                .catch(err => console.error("Auth failed, using mock:", err))
            // 3. Real Data Fetch for Prizes
            setLoading(true);
            fetch(`/api/webapp/user-prizes?initData=${encodeURIComponent(rawInitData)}`)
                .then(async res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    const data = await res.json();
                    if (data.activePrizes && data.activePrizes.length > 0) {
                        setPrizes(data.activePrizes);
                    } else {
                        throw new Error('No active prizes found');
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch prizes", err);
                    alert("Failed to load prizes. Please check connection.");
                })
                .finally(() => setLoading(false));
        } else {
            // Non-Telegram environment
            setLoading(false);
            // Leave empty to show "No prizes" state instead of confusing mocks
        }

        // Timer
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

    }, [])

    const handleSpin = async () => {
        if (spinning || !user || user.points < 10) return

        // 1. Optimistic Update (Instant feedback)
        setUser(prev => prev ? { ...prev, points: prev.points - 10 } : null)

        setSpinning(true)
        setWinIndex(null)
        setWinResult(null)

        try {
            // MOCK SPIN RESPONSE (Simulate Network)
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s network delay

            // Real Spin API
            const res = await fetch('/api/webapp/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            const data = await res.json();

            if (data.success) {
                if (typeof data.points === 'number') {
                    setUser(prev => prev ? { ...prev, points: data.points } : null)
                }

                // Find index of prize from the updated prize list
                const idx = prizes.findIndex(p => p.id === data.prize.id)
                if (idx !== -1) {
                    setWinIndex(idx)
                    setWinResult(data.prize)
                } else {
                    // Fallback if prize not found in local list (e.g. was just added)
                    // We just show the prize data returned from server
                    setWinIndex(0); // Default to first item just to spin
                    setWinResult(data.prize);
                }
            } else {
                alert('Error spinning (Mock)')
                setSpinning(false)
            }
        } catch (e) {
            console.error(e)
            setSpinning(false)
        }
    }

    const onSpinEnd = () => {
        setSpinning(false)
        // No redundant fetch here. Points were already updated in handleSpin response.
        setWinIndex(null)
    }

    // Real Daily Bonus Handler
    const handleDailyClaim = async () => {
        try {
            const res = await fetch('/api/webapp/claim-daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            })
            const data = await res.json()

            if (data.success) {
                setUser(prev => prev ? { ...prev, points: data.points } : null);
                setDailyStreak(data.streak);
                setLastDailyDate(new Date().toISOString());
                setIsDailyAvailable(false);
                setIsDailyOpen(false);
            } else {
                alert(data.error || 'Ошибка получения бонуса');
            }
        } catch (e) {
            console.error(e)
            alert('Ошибка сети');
        }
    }

    const canSpin = (user?.points || 0) >= 10;

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#FF4500]"><Loader2 className="animate-spin text-white" /></div>

    // Removed the "Open in Telegram" check for this Test Mode

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#FF4500] to-[#FF5500] overflow-hidden relative font-sans">

            {/* 1. Main Background Content: Slot Machine (Full Screen) */}
            <div className="absolute inset-0 z-0">
                {prizes.length > 0 && (
                    <SlotMachine
                        prizes={prizes}
                        spinning={spinning}
                        winIndex={winIndex}
                        onSpinEnd={onSpinEnd}
                    />
                )}
            </div>

            {/* 2. UI Overlay Layer - Hidden during spin */}
            <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 ${spinning ? 'opacity-0' : 'opacity-100'}`}>

                {/* Top Right: Balance */}
                <div className="absolute top-4 right-4 pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl pl-3 pr-2 py-1.5 flex items-center gap-2 border border-white/10 shadow-lg group active:scale-95 transition-transform">
                        <span className="font-black text-xl text-white tracking-wider leading-none pt-0.5">{user?.points || 0}</span>
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                            <span className="font-serif font-bold text-yellow-700 text-xs">$</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="absolute top-20 right-4 flex flex-col gap-6 items-center pointer-events-auto">

                    {/* Prizes */}
                    <button
                        onClick={() => setIsPrizesOpen(true)}
                        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                    >
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Gift className="w-6 h-6 text-green-300 drop-shadow-md" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide drop-shadow-md">Призы</span>
                    </button>

                    {/* Tasks */}
                    <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Target className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <div className="flex flex-col items-center leading-none gap-0.5">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wide drop-shadow-md">Задания</span>
                            <span className="text-[9px] font-bold text-white/80 uppercase tracking-wide drop-shadow-md">и игры</span>
                        </div>
                    </button>

                    {/* Daily Login + Timer */}
                    <button
                        onClick={() => setIsDailyOpen(true)}
                        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                    >
                        {isDailyAvailable ? (
                            <>
                                {/* READY TO CLAIM STATE */}
                                <div className="w-14 h-14 bg-gradient-to-b from-[#ff9500] to-[#ff5e00] rounded-2xl border-2 border-white/50 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(255,165,0,0.6)] relative overflow-hidden animate-pulse">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    <Coins className="w-6 h-6 text-white drop-shadow-md mb-0.5" />
                                    <div className="bg-black/80 px-1 rounded text-[7px] font-black uppercase text-white tracking-widest leading-tight py-0.5">
                                        ЗАБИРАЙТЕ
                                    </div>
                                </div>
                                <div className="flex flex-col items-center leading-none gap-0.5 mt-1">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wide drop-shadow-md text-[#ffcc00]">Монетки</span>
                                    <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide drop-shadow-md">за вход</span>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* WAITING STATE */}
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Coins className="w-6 h-6 text-yellow-400 drop-shadow-md" />

                                    {/* Timer Overlay Tag */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] font-mono text-white text-center py-[2px] backdrop-blur-[1px]">
                                        {timeLeft}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center leading-none gap-0.5">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wide drop-shadow-md">Монетки</span>
                                    <span className="text-[9px] font-bold text-white/80 uppercase tracking-wide drop-shadow-md">за вход</span>
                                </div>
                            </>
                        )}
                    </button>

                </div>
            </div>

            {/* Bottom: Spin Button Pinned */}
            <div className="absolute bottom-8 left-6 right-6 z-30 pointer-events-auto">
                <button
                    onClick={handleSpin}
                    disabled={spinning || !canSpin}
                    className={`
                        w-full h-[52px] rounded-2xl font-black text-2xl uppercase tracking-widest italic flex items-center justify-center gap-3
                        shadow-[0_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px]
                        transition-all duration-200
                        ${!canSpin
                            ? 'bg-black text-white' // Black bg, White text for idle
                            : 'bg-black text-white' // Always Black for Spin
                        }
                    `}
                >
                    {spinning ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            <span className="animate-pulse opacity-50">КРУТИМ...</span>
                        </>
                    ) : canSpin ? (
                        <>
                            <span>ВРАЩАТЬ ЗА 10</span>
                            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                                <span className="font-serif font-bold text-yellow-700 text-xs">$</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <span>НУЖНО 10</span>
                            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                                <span className="font-serif font-bold text-yellow-700 text-xs">$</span>
                            </div>
                        </>
                    )}
                </button>
                <p className="text-center text-white/40 text-[9px] mt-3 uppercase tracking-wider font-bold">
                    Нажимая «Вращать», я соглашаюсь с <a href="#" className="underline hover:text-white">Правилами</a>
                </p>
            </div>

            {/* Daily Bonus Modal */}
            <DailyBonus
                isOpen={isDailyOpen}
                onClose={() => setIsDailyOpen(false)}
                streak={dailyStreak}
                onClaim={handleDailyClaim}
                lastClaimDate={lastDailyDate}
            />

            {/* Win Modal */}
            <AnimatePresence>
                {/* Prizes Modal */}
                <PrizesModal
                    isOpen={isPrizesOpen}
                    onClose={() => setIsPrizesOpen(false)}
                    initData={initData}
                />

                {winResult && (
                    <WinModal
                        prize={winResult}
                        onClose={() => {
                            setWinResult(null)
                            // Also reset spin state here just in case, though onSpinEnd handles it
                        }}
                    />
                )}
            </AnimatePresence>

        </div>
    )
}
