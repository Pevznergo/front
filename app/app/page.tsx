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

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#FF4500]"><Loader2 className="animate-spin text-white" /></div>

    if (!user && !loading && process.env.NODE_ENV !== 'development') {
        return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-[#FF4500] text-white">
            <h1 className="text-2xl font-bold mb-4">Welcome to Aporto Prize Wheel</h1>
            <p>Please open this in Telegram.</p>
        </div>
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FF4500] overflow-hidden relative font-sans">
            {/* Top Bar */}
            <div className="flex justify-center items-center p-4 relative z-10">
                {/* Balance Pill */}
                <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="font-black text-xl text-black">{user?.points || 0}</span>
                    <Coins className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>

                {/* Right Actions */}
                <div className="absolute right-4 flex gap-3">
                    <button className="flex flex-col items-center text-white/90 hover:text-white transform hover:scale-105 transition-transform">
                        <Gift className="w-6 h-6 drop-shadow-md" />
                        <span className="text-[10px] font-bold mt-1 shadow-sm">Призы</span>
                    </button>
                    <button className="flex flex-col items-center text-white/90 hover:text-white transform hover:scale-105 transition-transform">
                        <Target className="w-6 h-6 drop-shadow-md" />
                        <span className="text-[10px] font-bold mt-1 shadow-sm">Задания</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area (Centered) */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* Slot Machine Display */}
                <div className="w-full relative py-8">
                    {/* Decorative Elements (like in screenshot) */}
                    {/* Can add falling coins or background 3D elements here if needed */}

                    {prizes.length > 0 && (
                        <SlotMachine
                            prizes={prizes}
                            spinning={spinning}
                            winIndex={winIndex}
                            onSpinEnd={onSpinEnd}
                        />
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pb-12 w-full max-w-md mx-auto z-10 relative">
                <button
                    onClick={handleSpin}
                    disabled={spinning || (user?.points || 0) < 10}
                    className={`
                        w-full py-5 rounded-2xl font-black text-2xl uppercase tracking-wider italic
                        shadow-[0_6px_0_#e5e5e5] active:shadow-none active:translate-y-[6px]
                        transition-all duration-150
                        ${spinning || (user?.points || 0) < 10
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-white text-black hover:bg-gray-50'}
                    `}
                >
                    {spinning ? 'Крутим...' : 'НУЖНО 10 🟡'}
                </button>

                <p className="text-center text-white/60 text-[10px] mt-4 px-4 leading-tight">
                    Нажимая «Вращать», я соглашаюсь с <a href="#" className="underline">Условиями акции</a>, <a href="#" className="underline">Правилами сервиса</a> и <a href="#" className="underline">Политикой</a>.
                </p>
            </div>
        </div>
    )
}
