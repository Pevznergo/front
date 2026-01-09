"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

const CARD_HEIGHT = 180; // Larger cards
const GAP = 20;

export default function SlotMachine({ prizes, spinning, winIndex, onSpinEnd }: SlotMachineProps) {
    const [offset, setOffset] = useState(200); // Start at 2nd item (180 + 20)
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
            const targetOffset = targetIndex * ITEM_SIZE;

            setOffset(targetOffset);

            const duration = 4000;
            setTimeout(() => {
                onSpinEnd();
            }, duration);
        }
    }, [spinning, winIndex, prizes.length, ITEM_SIZE, onSpinEnd]);

    // Calculate current transform based on state
    // "Hiccup Up": Move strip DOWN by small amount (wind up)
    const getTransform = () => {
        if (spinning) {
            return `translateY(-${offset}px)`;
        }
        switch (idleStage) {
            case 'hiccup-up':
                return `translateY(-${offset - 30}px)`; // Wind up DOWN
            case 'drop':
            case 'static':
            default:
                return `translateY(-${offset}px)`;
        }
    };

    return (
        <div className="w-full h-full relative overflow-hidden flex justify-center">
            {/* Gradient Overlays (Top/Bottom Fades) - As requested in screenshot */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FF4500] via-[#FF4500]/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FF6000] via-[#FF6000]/90 to-transparent z-10 pointer-events-none" />

            {/* Center Indicators (White Arrows, Only when Spinning) */}
            {spinning && (
                <>
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 z-20 animate-pulse">
                        <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[30px] border-l-white drop-shadow-md" />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 rotate-180 animate-pulse">
                        <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[30px] border-l-white drop-shadow-md" />
                    </div>
                </>
            )}

            {/* Speed Lines Overlay (Visible only when spinning) */}
            <div
                className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${spinning ? 'opacity-30' : 'opacity-0'}`}
                style={{
                    background: `
                        linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 10%, transparent 20%),
                        linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)
                    `,
                    backgroundSize: '100% 200%',
                    animation: 'speedLines 0.2s linear infinite'
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
                className="flex flex-col items-center absolute w-full"
                style={{
                    // Centering: Parent is full height. We center strip vertically.
                    // transform-origin is important.
                    top: '50%',
                    marginTop: -CARD_HEIGHT / 2, // Shift up by half card height to center active card
                    transform: getTransform(),
                    transition: spinning
                        ? 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)'
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
                        style={{ width: '85%', height: CARD_HEIGHT }} // Wider cards for full impact
                    >
                        {/* 3D Card Styling (Matching screenshot vibe: Orange/Red blocky) */}
                        <div className={`
                            w-full h-full rounded-3xl flex items-center justify-between px-8 relative overflow-hidden
                            ${i % 2 === 0 ? 'bg-[#ff5500]' : 'bg-[#ff6600]'} 
                            shadow-[0_8px_0_rgba(0,0,0,0.15)] 
                            transform hover:scale-[1.02] transition-transform
                        `}>
                            {/* Decorative Circles */}
                            <div className="absolute top-[-20%] left-[-10%] w-20 h-20 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-xl" />

                            {/* Left: Value */}
                            <div className="text-white z-10">
                                {prize.type === 'coupon' ? (
                                    <div className="text-6xl font-black italic drop-shadow-sm tracking-tighter">
                                        {prize.value}
                                    </div>
                                ) : prize.type === 'physical' ? (
                                    <div className="text-4xl font-black italic drop-shadow-sm">
                                        iPhone 15
                                    </div>
                                ) : (
                                    <div className="text-6xl font-black italic drop-shadow-sm flex items-baseline">
                                        {prize.value}
                                        <span className="text-4xl ml-1">₽</span>
                                    </div>
                                )}
                                <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 ml-1">
                                    {prize.name}
                                </div>
                            </div>

                            {/* Right: Icon/Decor */}
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner z-10">
                                <span className="text-4xl">🎁</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
