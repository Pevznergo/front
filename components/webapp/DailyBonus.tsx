'use client'

import { useState, useEffect } from 'react'
import { X, Check, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    const [closing, setClosing] = useState(false)
    const [timeLeft, setTimeLeft] = useState('')

    // Handle closing animation
    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setClosing(false)
            onClose()
        }, 300)
    }

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

    // Determine Status
    // If lastClaimDate was today -> Today is "Collected"
    // If lastClaimDate was yesterday -> Today is "Ready" (implied by streak logic outside potentially)
    // Actually, logic:
    // streak = current day index to claim (1-7).
    // if claimed today, streak might be N, but we show N as collected.
    // We need to know if "claimed today".

    // Simplification for UI:
    // Pass `streak` as "Days Collected So Far including today if claimed".
    // Or `streak` = "Current Level". And `claimedToday` boolean.

    // Let's assume logic is passed or calculated.
    // For this UI component, let's derive "Days" state.

    // Scenario A: User comes on Day 1. Has not claimed.
    // Streak = 0? Or 1?
    // Let's assume `streak` is the count of consecutive days BEFORE today if not claimed, 
    // OR count including today if claimed?

    // Better: Helper `isClaimedToday`
    const isClaimedToday = () => {
        if (!lastClaimDate) return false
        const last = new Date(lastClaimDate)
        const now = new Date()
        return last.toDateString() === now.toDateString()
    }

    const claimedToday = isClaimedToday()

    // Calculate which day is "Today"
    // If claimed today: current day is `streak` (e.g. claimed day 1, streak=1)
    // If not claimed today: current day is `streak + 1` (e.g. claimed yesterday day 0, streak=0, today is day 1)
    const currentDayIndex = claimedToday ? streak - 1 : streak

    // Handling Auto-Claim or Click Claim
    // If not claimed today, user should click "Today's" card?
    // User requirement: "icon becomes checkmark upon receiving".
    // I will expose `onClaim` when clicking the active day.

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Modal Panel */}
            <div
                className={`
                    w-full max-w-md bg-[#1c1c1e] text-white rounded-t-3xl sm:rounded-3xl p-6 pb-12 relative transform transition-transform duration-300
                    ${closing ? 'translate-y-full' : 'translate-y-0'}
                `}
            >
                {/* Handle Bar (Mobile) */}
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 absolute top-3 left-1/2 -translate-x-1/2" />

                {/* Header */}
                <div className="text-center mb-8 mt-2">
                    <h2 className="text-2xl font-bold mb-2">Daily Coins</h2>
                    <p className="text-gray-400 text-sm px-6 leading-relaxed">
                        Log in daily to collect maximum coins for the week
                    </p>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {REWARDS.map((amount, index) => {
                        // Logic for state
                        const dayNum = index + 1

                        // Status determination
                        const isCompleted = index < streak // In past or collected today
                        const isToday = index === currentDayIndex
                        // If we are strictly following "streak", past days are completed.
                        // If not claimed today, `isToday` is the target.
                        // If claimed today, `isToday` (streak-1) is completed.

                        // Refined Logic based on "streak":
                        // streak = number of days collected.
                        // if claimedToday: days [0..streak-1] are collected.
                        // if !claimedToday: days [0..streak-1] are collected. Day [streak] is Target.

                        // Visual State:
                        // Collected: Green Checkmark.
                        // Active (Today, Uncollected): White Highlight, Clickable?
                        // Future: Locked (Gray).

                        let state = 'locked'
                        if (index < streak) {
                            state = 'collected' // Past streaks are collected
                        } else if (index === streak && !claimedToday) {
                            state = 'active' // Today, waiting to collect
                        }

                        // Special case: If user missed streaks and reset, `streak` is low.
                        // This visualizes the *current run*.

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
                                    ${dayNum > 4 && index >= 4 ? 'col-span-1.3' : ''} // Layout adjustment for bottom row? Screen shows 4 top, 3 bottom.
                                `}
                                style={{
                                    // Custom Grid layout to match screenshot: 4 top, 3 bottom.
                                    // 7 items total.
                                    // CSS Grid `grid-cols-4`.
                                    // Items 5, 6, 7 need to be centered or span?
                                    // Screenshot: Top 4 aligned. Bottom 3 aligned.
                                    // We can just use flex wrap or grid with specific placement.
                                    gridColumn: index >= 4 ? 'auto' : 'auto'
                                }}
                            >
                                {/* Day Label */}
                                <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-white' : 'text-gray-500'}`}>
                                    {isToday ? 'Today' : `Day ${dayNum}`}
                                </span>

                                {/* Coin/Check Circle */}
                                {state === 'collected' ? (
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <Check className="w-6 h-6 text-white" />
                                    </div>
                                ) : (
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shadow-lg relative z-10
                                        ${state === 'active' ? 'bg-white' : 'bg-[#3a3a3c]'}
                                    `}>
                                        {/* Coin Icon or Text */}
                                        <div className="font-black text-xs text-black">{amount}</div>
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

                                {/* Checkmark Badge for Active (Overlay) */}
                                {state === 'collected' && isToday && (
                                    <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full" />
                                )}
                            </div>
                        )
                    })}
                </div>
                {/* CSS correction for 4 top 3 bottom centered */}
                <style jsx>{`
                    .grid-cols-4 {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    .grid-cols-4 > div {
                        width: calc(25% - 0.75rem); /* roughly 1/4 minus gap */
                        margin-bottom: 0.75rem;
                        min-width: 70px;
                    }
                `}</style>


                {/* Footer Timer Panel */}
                <div className="mt-4 bg-[#2c2c2e] rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-xs text-gray-500 font-medium mb-1">Next reward in</span>
                    <span className="text-xl font-mono font-bold text-white tracking-widest">{timeLeft}</span>
                </div>
            </div>
        </div>
    )
}
