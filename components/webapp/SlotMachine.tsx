"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming utils exist, or I can define helper

interface Prize {
    id: number;
    name: string;
    type: string;
    value: string;
    image_url?: string;
}

interface SlotMachineProps {
    prizes: Prize[];
    spinning: boolean;
    winIndex: number | null;
    onSpinEnd: () => void;
}

const CARD_WIDTH = 200; // px
const GAP = 20; // px
const VISIBLE_ITEMS = 3; // How many items visible on screen (approx)

export default function SlotMachine({ prizes, spinning, winIndex, onSpinEnd }: SlotMachineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Create a long strip of prizes for the "infinite" feel
    // We repeat the prize list enough times to cover idle animation + spin distance
    // Idle needs to loop. Spin needs to go far forward.
    const REPEAT_COUNT = 50;
    const extendedPrizes = Array(REPEAT_COUNT).fill(prizes).flat();

    const TOTAL_ITEM_WIDTH = CARD_WIDTH + GAP;

    // Idle Animation Reference
    const idleInterval = useRef<NodeJS.Timeout | null>(null);

    // 1. Idle Animation (Jerky Movement)
    useEffect(() => {
        if (spinning) {
            if (idleInterval.current) clearInterval(idleInterval.current);
            return;
        }

        // Jerky movement: every 1.5s, slide 1 card over
        // We reset offset to 0 modulo prize.length * width to loop seamlessly?
        // Simpler: Just keep increasing offset, and when it gets too far, reset it (virtual scroll)
        // But for visual "jerk", we animate 0 -> 1 over 0.3s, then wait.

        const moveOneStep = () => {
            setOffset(prev => {
                const next = prev + TOTAL_ITEM_WIDTH;
                // Seamless loop reset logic could go here if array wasn't huge
                // For now, just let it scroll. 50 repeats is plenty for idle time.
                return next;
            });
        };

        idleInterval.current = setInterval(moveOneStep, 1000); // 1s wait

        return () => {
            if (idleInterval.current) clearInterval(idleInterval.current);
        };
    }, [spinning, TOTAL_ITEM_WIDTH]);


    // 2. Spin Logic
    useEffect(() => {
        if (spinning && winIndex !== null) {
            // Calculate target position
            // We want to land on the specific prize instance far in the future
            // Let's pick a loop index far ahead (e.g., 40th repetition)
            const LOOP_TARGET = 35;
            const targetIndex = (LOOP_TARGET * prizes.length) + winIndex;

            // Random offset within the card to make it look natural? No, center it.
            // Center alignment: 
            // Screen center = 50vw. 
            // We want center of card (CARD_WIDTH/2) to align with screen center.
            // But simplified: just scroll to exact position.

            const targetOffset = targetIndex * TOTAL_ITEM_WIDTH;

            setIsAnimating(true); // Switch to CSS transition for smooth fast spin
            setOffset(targetOffset);

            // Wait for transition end
            // Transition duration should be ~4-5s for effect
            const duration = 4000;
            setTimeout(() => {
                onSpinEnd();
                setIsAnimating(false);
                // Optional: Snap back to a lower index (modulo) for next run to prevent overflow?
                // Visual jump might be noticeable. Better to just reset whole component or prizes.
            }, duration);
        }
    }, [spinning, winIndex, prizes.length, TOTAL_ITEM_WIDTH, onSpinEnd]);

    return (
        <div className="w-full overflow-hidden relative h-[300px] flex items-center">
            {/* Center Indicator / Arrow? (Optional, user didn't ask but implied by 'stop on something') */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[4px] bg-yellow-400/50 z-20 hidden" />

            {/* Scrolling Strip */}
            <div
                className="flex items-center absolute left-1/2" // Start from center-ish
                style={{
                    transform: `translateX(calc(-50% - ${offset - (CARD_WIDTH / 2)}px))`, // Center the current item
                    transition: isAnimating ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'transform 0.3s ease-out', // Fast spin vs Idle jerk
                    gap: GAP
                }}
            >
                {extendedPrizes.map((prize, i) => (
                    <div
                        key={`${prize.id}-${i}`}
                        className="flex-shrink-0 relative"
                        style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.8 }}
                    >
                        {/* 3D Card Styling */}
                        <div className={`
                            w-full h-full rounded-2xl flex flex-col items-center justify-center p-4
                            transition-transform duration-300
                            ${i % 2 === 0 ? 'bg-[#FF4500]' : 'bg-[#FF5500]'} // Slight variation
                            shadow-[0_10px_0_#992b00] // 3D "bottom" edge
                            border-2 border-white/20
                            transform hover:-translate-y-2
                        `}>
                            {/* Inner Content */}
                            <div className="text-white text-center">
                                {/* If image exists use it, else text */}
                                {prize.type === 'coupon' || prize.type === 'physical' ? (
                                    <div className="mb-2 text-5xl font-black italic">
                                        {prize.value.replace('ozon_', '').replace('wb_', '').replace('iphone', '📱')}
                                    </div>
                                ) : (
                                    <div className="mb-2 text-5xl font-black italic">
                                        {prize.value}<span className="text-2xl">₽</span>
                                    </div>
                                )}

                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded">
                                    {prize.name}
                                </div>
                            </div>

                            {/* Decorative Shine */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none rounded-r-2xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
