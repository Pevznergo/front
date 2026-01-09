"use client";

import { useEffect, useState, useMemo } from "react";
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
    const [offset, setOffset] = useState(200); // Start at 2nd item
    const [idleStage, setIdleStage] = useState<'static' | 'hiccup-up' | 'drop'>('static');

    // Memoize the extended prize list to prevent re-renders breaking transitions
    const extendedPrizes = useMemo(() => {
        const REPEAT_COUNT = 24; // Reduce significantly to prevent Main Thread blocking (was 100)
        return Array(REPEAT_COUNT).fill(prizes).flat();
    }, [prizes]);

    const ITEM_SIZE = CARD_HEIGHT + GAP;

    // Idle Animation Interval
    useEffect(() => {
        if (spinning) {
            setIdleStage('static');
            return;
        }

        const interval = setInterval(() => {
            setIdleStage('hiccup-up');

            setTimeout(() => {
                setIdleStage('drop');
                setOffset(prev => prev - ITEM_SIZE);
            }, 300);

            setTimeout(() => {
                setIdleStage('static');
            }, 800);

        }, 3000);

        return () => clearInterval(interval);
    }, [spinning, ITEM_SIZE]);


    // Spin Logic
    useEffect(() => {
        if (spinning && winIndex !== null) {
            // Target specific prize instance near the BEGINNING (Top)
            // Start fairly deep (e.g. index 20*L), spin UP to index 2*L
            const LOOP_TARGET = 2;
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
    const getTransform = () => {
        if (spinning) {
            return `translate3d(0, -${offset}px, 0)`;
        }
        switch (idleStage) {
            case 'hiccup-up':
                return `translate3d(0, -${offset + 40}px, 0)`;
            case 'drop':
            case 'static':
            default:
                return `translate3d(0, -${offset}px, 0)`;
        }
    };

    // Initial Offset: Start deep enough (e.g. at 20th repetition)
    useEffect(() => {
        if (prizes.length > 0 && offset < 1000) {
            // 24 reps total. Start at 18.
            setOffset((prizes.length * 18 + 1) * ITEM_SIZE);
        }
    }, [prizes.length, ITEM_SIZE]);

    return (
        <div className="w-full h-full relative overflow-hidden flex justify-center">
            {/* ... (keep overlays same) ... */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FF4500] via-[#FF4500]/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FF6000] via-[#FF6000]/90 to-transparent z-10 pointer-events-none" />

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

            <div
                className="flex flex-col items-center absolute w-full will-change-transform"
                style={{
                    top: '50%',
                    marginTop: -CARD_HEIGHT / 2,
                    transform: getTransform(),
                    transition: spinning
                        ? 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)'
                        : idleStage === 'drop' ? 'transform 0.5s cubic-bezier(0.5, 0, 0, 1)'
                            : idleStage === 'hiccup-up' ? 'transform 0.3s ease-out'
                                : 'none',
                    gap: GAP
                }}
            >
                {extendedPrizes.map((prize, i) => (
                    <div
                        key={`${prize.id}-${i}`}
                        className="flex-shrink-0 relative transition-transform duration-300 transform"
                        style={{ width: '85%', height: CARD_HEIGHT }}
                    >
                        {/* 3D Card Styling (Matching screenshot vibe: Orange/Red blocky) */}
                        <div className={`
                            w-full h-full rounded-3xl flex items-center justify-between px-8 relative overflow-hidden
                            ${i % 2 === 0 ? 'bg-[#ff5500]' : 'bg-[#ff6600]'} 
                            shadow-[0_8px_0_rgba(0,0,0,0.15)] 
                            transform hover:scale-[1.02] transition-transform
                        `}>
                            {/* Decorative Circles - Dynamic Blur (Off during spin for performance) */}
                            <div className={`absolute top-[-20%] left-[-10%] w-20 h-20 bg-white/10 rounded-full ${spinning ? '' : 'blur-xl'} transition-all duration-300`} />
                            <div className={`absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full ${spinning ? '' : 'blur-xl'} transition-all duration-300`} />

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

                            {/* Right: Icon/Decor - Dynamic Blur */}
                            <div className={`w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border border-white/20 shadow-inner z-10 ${spinning ? '' : 'backdrop-blur-sm'} transition-all duration-300`}>
                                <span className="text-4xl">🎁</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
