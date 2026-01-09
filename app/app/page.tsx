'use client'

import { useEffect, useState } from 'react'
import SlotMachine from '@/components/webapp/SlotMachine'
import { Loader2, Gift, Target, Coins } from 'lucide-react'

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

    useEffect(() => {
        // Initialize WebApp
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            const tg = (window as any).Telegram.WebApp
            tg.ready()
            tg.expand() // Fullscreen
            tg.setHeaderColor('#FF4500'); // Orange header

            const rawInitData = tg.initData
            setInitData(rawInitData)

            // Auth call
            fetch('/api/webapp/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData: rawInitData })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user)
                    }
                })
                .catch(err => console.error(err))

            // Fetch Prizes
            fetch('/api/webapp/prizes')
                .then(res => res.json())
                .then(data => {
                    if (data.prizes) setPrizes(data.prizes)
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        } else {
            // Dev fallback
            setLoading(false)
            // Mock data for dev
            if (process.env.NODE_ENV === 'development') {
                setPrizes([
                    { id: 1, name: '1000₽', type: 'points', value: '1000', probability: '0.1' },
                    { id: 2, name: '500₽', type: 'points', value: '500', probability: '0.2' },
                    { id: 3, name: '-20%', type: 'coupon', value: '-20%', probability: '0.2' },
                    { id: 4, name: 'iPhone', type: 'physical', value: 'iphone', probability: '0.01' }
                ])
                setUser({ telegram_id: 123, first_name: 'Dev', points: 100 })
            }
        }
    }, [])

    const handleSpin = async () => {
        if (spinning || !user || user.points < 10) return

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
                // Find index of prize
                const idx = prizes.findIndex(p => p.id === data.prize.id)
                if (idx !== -1) {
                    setWinIndex(idx)
                    setWinResult(data.prize)
                } else {
                    setSpinning(false)
                }
            } else {
                alert(data.error || 'Error spinning')
                setSpinning(false)
            }
        } catch (e) {
            console.error(e)
            setSpinning(false)
        }
    }

    const onSpinEnd = () => {
        setSpinning(false)
        if (winResult) {
            // alert(`You won: ${winResult.name}!`) // Optional: remove alert for smoother UX
            // Refresh user data (points)
            fetch('/api/webapp/auth', {
                method: 'POST',
                body: JSON.stringify({ initData })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) setUser(data.user)
                })
        }
        setWinIndex(null)
    }

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState("");

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

    const canSpin = (user?.points || 0) >= 10;

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#FF4500]"><Loader2 className="animate-spin text-white" /></div>

    if (!user && !loading && process.env.NODE_ENV !== 'development') {
        return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-[#FF4500] text-white">
            <h1 className="text-2xl font-bold mb-4">Welcome to Aporto Prize Wheel</h1>
            <p>Please open this in Telegram.</p>
        </div>
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FF4500] to-[#FF8C00] overflow-hidden relative font-sans">
            {/* Left-Aligned Header */}
            <div className="flex flex-col items-start p-4 pt-6 gap-3 z-10 relative">

                {/* 1. Balance Pill (Top Left) */}
                <div className="bg-black/20 backdrop-blur-sm rounded-full pl-3 pr-4 py-1.5 flex items-center gap-2 border border-white/10">
                    <span className="font-black text-xl text-white">{user?.points || 0}</span>
                    <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>

                {/* 2. Action Icons (Below Balance) */}
                <div className="flex items-center gap-3">
                    <button className="flex flex-col items-center group">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-active:scale-95 transition-all">
                            <Gift className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-white mt-1 uppercase tracking-wide opacity-80">Призы</span>
                    </button>

                    <button className="flex flex-col items-center group">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-active:scale-95 transition-all">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-white mt-1 uppercase tracking-wide opacity-80">Задания</span>
                    </button>

                    <button className="flex flex-col items-center group">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-active:scale-95 transition-all relative overflow-hidden">
                            <Coins className="w-5 h-5 text-yellow-300" />
                            {/* <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 rounded-full -mt-1 -mr-1 font-bold">24h</div> */}
                        </div>
                        <div className="flex flex-col items-center mt-1">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wide opacity-80 leading-none">Вход</span>
                            <span className="text-[8px] font-mono text-yellow-200 leading-none mt-0.5">{timeLeft}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Vertical Slot Machine Area (Centered) */}
            <div className="flex-1 flex flex-col items-center justify-center relative -mt-10">
                {prizes.length > 0 && (
                    <SlotMachine
                        prizes={prizes}
                        spinning={spinning}
                        winIndex={winIndex}
                        onSpinEnd={onSpinEnd}
                    />
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pb-8 w-full max-w-md mx-auto z-10 relative">
                <button
                    onClick={handleSpin}
                    disabled={spinning || !canSpin}
                    className={`
                        w-full py-5 rounded-2xl font-black text-2xl uppercase tracking-wider italic flex items-center justify-center gap-2
                        shadow-[0_6px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[6px]
                        transition-all duration-150
                        ${!canSpin
                            ? 'bg-white text-gray-400'
                            : 'bg-white text-black hover:bg-gray-50'}
                    `}
                >
                    {spinning ? (
                        <span>КРУТИМ...</span>
                    ) : canSpin ? (
                        <>
                            <span>ВРАЩАТЬ ЗА 10</span>
                            <Coins className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </>
                    ) : (
                        <>
                            <span>НУЖНО 10</span>
                            <Coins className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </>
                    )}
                </button>

                <p className="text-center text-white/50 text-[10px] mt-4 px-4 leading-tight">
                    Нажимая «Вращать», я соглашаюсь с <a href="#" className="underline">Правилами</a>.
                </p>
            </div>
        </div>
    )
}
