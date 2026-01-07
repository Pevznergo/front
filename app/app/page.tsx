'use client'

import { useEffect, useState } from 'react'
import Wheel from '@/components/webapp/Wheel'
// import { WebAppUser } from '@/types/telegram' // Removed unused import
import { Loader2 } from 'lucide-react'

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
            // Dev fallback or error
            setLoading(false)
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
                    // Update points immediately? Or wait? 
                    // Let's update points AFTER spin for effect, but we have data.points now
                    // We can store it in temp state to commit later
                } else {
                    // Error finding prize in list?
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
            alert(`You won: ${winResult.name}!`)
            // Refresh user data (points)
            // Or just fetch auth again? Efficient: Use returned points from spin
            // Wait, handleSpin got expected points.
            // Re-fetch auth to be safe and sync.
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

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-white" /></div>

    if (!user && !loading) {
        return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Welcome to Aporto Prize Wheel</h1>
            <p>Please open this in Telegram.</p>
        </div>
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-4 bg-gradient-to-b from-[#1a1a1a] to-[#000000]">
            {/* Header / Branding */}
            <div className="w-full mb-6 z-10 relative">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                        КЛУБ СОСЕДЕЙ 🏠
                    </h1>
                    <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium tracking-wide text-gray-300 uppercase border border-white/10 backdrop-blur-sm">
                        Закрытый чат
                    </span>
                    <p className="mt-3 text-sm text-gray-400 font-medium tracking-wide">
                        Колесо Призов: <span className="text-white">WB / OZON / iPhone</span>
                    </p>
                </div>

                {/* Balance Card */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Баланс</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-yellow-400 font-mono tracking-tighter shadow-yellow-500/20 drop-shadow-sm">
                                {user?.points || 0}
                            </span>
                            <span className="text-xs text-yellow-400/80 font-bold">Баллов</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 mb-1">Игрок</span>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs shadow-lg">
                                {(user?.first_name || 'U').charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wheel Area */}
            <div className="mb-12 scale-90 sm:scale-100">
                {prizes.length > 0 && (
                    <Wheel
                        prizes={prizes}
                        spinning={spinning}
                        winIndex={winIndex}
                        onSpinEnd={onSpinEnd}
                    />
                )}
            </div>

            {/* Controls */}
            <button
                onClick={handleSpin}
                disabled={spinning || (user?.points || 0) < 10}
                className={`
            w-full max-w-sm py-4 rounded-xl font-bold text-xl uppercase tracking-wider
            transition-all duration-200 transform active:scale-95
            ${spinning || (user?.points || 0) < 10
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/20'}
        `}
            >
                {spinning ? 'Spinning...' : 'Spin (-10 Points)'}
            </button>

            {/* Prize List (Optional, simple grid below) */}
            <div className="mt-12 w-full max-w-md">
                <h3 className="text-gray-400 text-sm uppercase font-bold mb-4 ml-2">Prizes Available</h3>
                <div className="grid grid-cols-2 gap-3">
                    {prizes.map(p => (
                        <div key={p.id} className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs flex justify-between">
                            <span>{p.name}</span>
                            {p.type === 'points' && <span className="text-yellow-400">+{p.value} pts</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
