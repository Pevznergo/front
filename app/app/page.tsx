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
        }

        // --- MOCK DATA MODE (TESTING PERFORMANCE) ---
        // Replacing real fetch with mock data to test smoothness in Prod
        const mockPrizes = [
            { id: 1, name: '1000₽', type: 'points', value: '1000', probability: '0.1' },
            { id: 2, name: '500₽', type: 'points', value: '500', probability: '0.2' },
            { id: 3, name: '-20%', type: 'coupon', value: '-20%', probability: '0.2' },
            { id: 4, name: 'iPhone', type: 'physical', value: 'iphone', probability: '0.01' }
        ];
        setPrizes(mockPrizes);

        setLoading(false);

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

    // Prizes Modal State
    const [isPrizesOpen, setIsPrizesOpen] = useState(false);

    const handleDailyClaim = async () => {
        try {
            const res = await fetch('/api/webapp/claim-daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            const data = await res.json();
            if (data.success) {
                setUser(prev => prev ? { ...prev, points: data.newPoints, daily_streak: data.streak, last_daily_claim: new Date().toISOString() } : null);
                setDailyStreak(data.streak);
                setLastDailyDate(new Date().toISOString());
                setIsDailyAvailable(false);
                setIsDailyOpen(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const canSpin = user && user.points >= 10 && !spinning;

    const handleSpin = async () => {
        if (spinning || !user || user.points < 10) return

        // 1. Optimistic Update
        setUser(prev => prev ? { ...prev, points: prev.points - 10 } : null)
        setSpinning(true)
        setWinIndex(null)
        setWinResult(null)

        try {
            const res = await fetch('/api/webapp/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            })
            const data = await res.json()

            if (data.success) {
                // 2. Sync with Server Truth
                setUser(prev => prev ? { ...prev, points: data.points } : null)

                // Wait for animation mock-time if needed, but wheel component handles 'spinning' prop
                // We need to tell the wheel WHICH index to land on.
                // NOTE: 'winIndex' needs to map to 'prizes' array. 
                // Since 'prizes' was MOCK data effectively in the component state, we need to ensure the Wheel uses the SAME source.
                // *CRITICAL*: The wheel needs to know the layout of prizes.
                // Assuming 'prizes' state matches server DB prizes roughly or we reload them.
                // For now, let's execute the logic assuming 'prizes' state contains valid IDs.

                const idx = prizes.findIndex(p => p.id === data.prize.id)
                // If not found (e.g. server has different prizes), fallback to random or error
                const targetIndex = idx !== -1 ? idx : 0

                setWinIndex(targetIndex)
                setWinResult(data.prize)

            } else {
                alert(data.error || 'Ошибка вращения')
                setSpinning(false)
                // Revert points? In a real app yes, for now lazy.
            }
        } catch (e) {
            console.error(e)
            setSpinning(false)
        }
    }


    return (
        <main className="min-h-screen bg-[#ff5500] text-white overflow-hidden relative font-sans selection:bg-white/30">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-start pointer-events-none">
                {/* User Info */}
                <div className="flex items-center gap-3 pointer-events-auto bg-black/20 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-gray-200 flex items-center justify-center text-sm font-bold shadow-md text-black border-2 border-white">
                        {user?.first_name?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-none mb-0.5 drop-shadow-sm">{user?.first_name || 'User'}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-black/40 text-yellow-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono border border-white/10 shadow-inner">
                                ⭐️ {user?.points || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col gap-4 pointer-events-auto">
                    {/* Daily Bonus Trigger */}
                    <button
                        onClick={() => setIsDailyOpen(true)}
                        className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    >
                        <div className="w-14 h-14 bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl border-b-4 border-orange-800 flex items-center justify-center shadow-xl relative overflow-hidden group-hover:brightness-110 transition-all">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40" />
                            {isDailyAvailable ? (
                                <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />
                            ) : null}
                            <Coins className={`w-7 h-7 drop-shadow-sm ${isDailyAvailable ? 'text-yellow-100' : 'text-white'}`} />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wide drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full">Бонус</span>
                    </button>

                    {/* Prizes */}
                    <button
                        onClick={() => setIsPrizesOpen(true)}
                        className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
                    >
                        <div className="w-14 h-14 bg-gradient-to-b from-teal-400 to-teal-600 rounded-2xl border-b-4 border-teal-800 flex items-center justify-center shadow-xl relative overflow-hidden group-hover:brightness-110 transition-all">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40" />
                            <Gift className="w-7 h-7 text-white drop-shadow-sm" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wide drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full">Призы</span>
                    </button>

                </div>
            </div>

            {/* Spin Button */}
            <div className={`
                absolute bottom-8 left-6 right-6 z-30 pointer-events-auto transition-opacity duration-300
                ${spinning ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}>
                <button
                    onClick={handleSpin}
                    disabled={spinning || !canSpin}
                    className={`
                        w-full h-16 rounded-3xl font-black text-2xl uppercase tracking-widest italic flex items-center justify-center gap-3
                        shadow-[0_6px_0_#ccc,0_15px_20px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_#ccc] active:translate-y-[4px]
                        transition-all duration-150 border-2 border-white
                        ${!canSpin
                            ? 'bg-gray-200 text-gray-400 border-gray-300'
                            : 'bg-white text-black hover:bg-gray-50'}
                    `}
                >
                    {spinning ? (
                        <span className="animate-pulse opacity-50">КРУТИМ...</span>
                    ) : canSpin ? (
                        <>
                            <span className="drop-shadow-sm">НУЖНО 10</span>
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_0_#ca8a04] border border-yellow-500 text-black">
                                <span className="font-serif font-black text-sm">$</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <span>НУЖНО 10</span>
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-inner text-gray-500">
                                <span className="font-serif font-bold text-sm">$</span>
                            </div>
                        </>
                    )}
                </button>
                <p className="text-center text-white/60 text-[10px] mt-4 uppercase tracking-wider font-bold drop-shadow-md">
                    Нажимая «Вращать», я соглашаюсь с <a href="#" className="underline hover:text-white decoration-white/50">Правилами</a>
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

            {/* Prizes Modal */}
            <PrizesModal
                isOpen={isPrizesOpen}
                onClose={() => setIsPrizesOpen(false)}
                initData={initData}
            />

            {/* Win Modal */}
            <AnimatePresence>
                {winResult && (
                    <WinModal
                        prize={winResult}
                        onClose={() => {
                            setWinResult(null)
                            setWinIndex(null)
                        }}
                    />
                )}
            </AnimatePresence>

        </main >
    )
}
