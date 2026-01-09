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

const CARD_HEIGHT = 160; // px
const GAP = 16; // px
const VISIBLE_ITEMS = 3;

export default function SlotMachine({ prizes, spinning, winIndex, onSpinEnd }: SlotMachineProps) {
    const [offset, setOffset] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [idleStage, setIdleStage] = useState<'static' | 'hiccup-up' | 'drop'>('static');

    // Vertical strip needs less horizontal width, but height
    const REPEAT_COUNT = 60;
    const extendedPrizes = Array(REPEAT_COUNT).fill(prizes).flat();

    const ITEM_SIZE = CARD_HEIGHT + GAP;

    // Idle Animation Interval
    useEffect(() => {
        if (spinning) {
            setIdleStage('static');
            return;
        }

        const interval = setInterval(() => {
            // Sequence: Static -> Hiccup Up -> Drop Down
            setIdleStage('hiccup-up');

            setTimeout(() => {
                setIdleStage('drop');
                setOffset(prev => prev + ITEM_SIZE);
            }, 300); // Wait 0.3s in "up" state before dropping

            setTimeout(() => {
                setIdleStage('static');
            }, 800); // Animation duration total

        }, 3000); // Every 3 seconds

        return () => clearInterval(interval);
    }, [spinning, ITEM_SIZE]);


    // Spin Logic
    useEffect(() => {
        if (spinning && winIndex !== null) {
            // Target specific prize instance deep in the list
            const LOOP_TARGET = 45;
            const targetIndex = (LOOP_TARGET * prizes.length) + winIndex;

            // Align center: We want the item to be reachable.
            // Since it's vertical, we seek `targetIndex * ITEM_SIZE`
            const targetOffset = targetIndex * ITEM_SIZE;

            setIsAnimating(true);
            setOffset(targetOffset);

            const duration = 4000;
            setTimeout(() => {
                onSpinEnd();
                setIsAnimating(false);
            }, duration);
        }
    }, [spinning, winIndex, prizes.length, ITEM_SIZE, onSpinEnd]);

    // Calculate current transform based on state
    // If spin: use offset directly with transition
    // If idle:
    //   Stage 'static': translateY(-offset)
    //   Stage 'hiccup-up': translateY(-offset - 15px)  (Move UP naturally means negative Y relative to item, but scroll moves stripe down? No, scroll moves stripe UP to show next.
    //      To show next item (index+1), we scroll to offset + ITEM_SIZE.
    //      "Start movement slightly UP" -> means we want to see a bit of the PREVIOUS item? Or just a bounce?
    //      Usually "Wind up" means moving opposite direction of travel.
    //      Travel is: 0 -> 100 (Stripe moves UP visually, items go UP).
    //      So "Wind up" should move Stripe DOWN (items go DOWN).
    //      Let's try translateY(-(offset - 20px)).
    const getTransform = () => {
        if (spinning) {
            return `translateY(-${offset}px)`;
        }

        // Idle logic
        switch (idleStage) {
            case 'hiccup-up':
                return `translateY(-${offset - 25}px)`; // Move strip DOWN (items down) = Wind up
            case 'drop':
                return `translateY(-${offset}px)`; // Move to new offset (which is already incremented in effect)
            case 'static':
            default:
                return `translateY(-${offset}px)`;
        }
    };

    return (
        <div className="w-full relative h-[400px] overflow-hidden flex justify-center bg-black/5 rounded-3xl">
            {/* Center Indicators (Arrows) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[25px] border-l-yellow-400 drop-shadow-lg filter drop-shadow(0 0 5px rgba(255,215,0,0.5))" />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 rotate-180">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[25px] border-l-yellow-400 drop-shadow-lg filter drop-shadow(0 0 5px rgba(255,215,0,0.5))" />
            </div>

            {/* Center Selection Frame (Optional subtle overlay) */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-[160px] bg-white/5 border-y border-white/10 z-10 pointer-events-none" />

            {/* Speed Lines Overlay (Visible only when spinning) */}
            <div
                className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 ${spinning ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    background: `
                        linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 10%, rgba(255,255,255,0) 20%),
                        linear-gradient(to bottom, rgba(255,255,255,0) 80%, rgba(255,255,255,0.8) 90%, rgba(255,255,255,0) 100%)
                    `,
                    backgroundSize: '100% 200%',
                    animation: 'speedLines 0.5s linear infinite'
                }}
            />
            <style jsx>{`
                @keyframes speedLines {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 0% 100%; }
                }
            `}</style>

            {/* The Strip */}
            <div
                className="flex flex-col items-center absolute top-0 w-full"
                // Best approach: Anchor Top, but initial offset centers the first item.
                style={{
                    // Centering first item: Container H=400. Item H=160. Center = 200. Item Center = 80.
                    // Initial Top should be 200 - 80 = 120px.
                    top: 0, // Anchor to top
                    paddingTop: (400 - CARD_HEIGHT) / 2, // Dynamically center the first item
                    transform: getTransform(),
                    transition: spinning
                        ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' // Fast then slow
                        : idleStage === 'drop' ? 'transform 0.5s cubic-bezier(0.5, 0, 0, 1)' // Heavy drop
                            : idleStage === 'hiccup-up' ? 'transform 0.3s ease-out' // Slow wind up
                                : 'none',
                    gap: GAP
                }}
            >
                {extendedPrizes.map((prize, i) => (
                    <div
                        key={`${prize.id}-${i}`}
                        className="flex-shrink-0 relative transition-transform duration-300 transform"
                        style={{ width: 280, height: CARD_HEIGHT }} // Fixed width for mobile cards
                    >
                        {/* 3D Card Styling */}
                        <div className={`
                            w-full h-full rounded-2xl flex items-center justify-between px-6
                            ${i % 2 === 0 ? 'bg-[#ff4d00]' : 'bg-[#ff5e00]'}
                            shadow-[0_8px_0_#cc3d00] // Bottom 3D edge
                            border-t border-white/20
                        `}>
                            {/* Left: Value */}
                            <div className="text-white">
                                {prize.type === 'coupon' || prize.type === 'physical' ? (
                                    <div className="text-4xl font-black italic drop-shadow-md">
                                        {prize.value.replace('ozon_', '').replace('wb_', '').replace('iphone', 'Phone')}
                                    </div>
                                ) : (
                                    <div className="text-5xl font-black italic drop-shadow-md">
                                        {prize.value}<span className="text-3xl ml-1">₽</span>
                                    </div>
                                )}
                            </div>

                            {/* Right: Icon/Decor (Optional) */}
                            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center border-2 border-white/10">
                                <span className="text-2xl">🎁</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
