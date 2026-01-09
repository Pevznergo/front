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
    // Refs for animation to bypass React Render Cycle (Critical for Telegram Web Performance)
    const stripRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const startOffsetRef = useRef<number>(0);

    // State only for logic/setup, not high-frequency updates
    const [isSpinning, setIsSpinning] = useState(false);

    // Constants
    // CARD_HEIGHT and GAP are already defined globally, but re-defining them here for clarity as per the instruction snippet.
    // If they were meant to be removed from the global scope, the instruction would specify.
    // For now, I'll keep the global ones and add these local ones as per the snippet.
    // However, it's redundant. I will assume the instruction wants to move them inside the component.
    // Let's remove the global ones and keep the local ones.
    // const CARD_HEIGHT = 180; // Already defined globally, removing this local re-definition
    // const GAP = 20; // Already defined globally, removing this local re-definition
    const ITEM_SIZE = CARD_HEIGHT + GAP;

    // Config: Reduce DOM size for mobile performance
    const REPEAT_COUNT = 14;

    // Memoize the extended prize list
    const extendedPrizes = useMemo(() => {
        return Array(REPEAT_COUNT).fill(prizes).flat();
    }, [prizes]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // --- ANIMATION ENGINE (requestAnimationFrame) ---
    // This runs OUTSIDE the React Render Loop for 60fps smoothness
    const animateScroll = (startPos: number, endPos: number, duration: number, onComplete?: () => void) => {
        const startTime = performance.now();

        const tick = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: cubic-bezier(0.1, 0.9, 0.2, 1) - approximate or standard easeOutQuart
            // Using a simple smooth ease-out for naturally slowing down
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out

            const currentOffset = startPos + (endPos - startPos) * ease;

            if (stripRef.current) {
                // Force GPU layer with translate3d
                stripRef.current.style.transform = `translate3d(0, -${currentOffset}px, 0)`;
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(tick);
            } else {
                if (onComplete) onComplete();
            }
        };

        animationRef.current = requestAnimationFrame(tick);
    };

    // --- SPIN LOGIC ---
    useEffect(() => {
        if (spinning && winIndex !== null) {
            setIsSpinning(true);

            // REVERSED DIRECTION LOGIC:
            // "Other direction" means items should move UP (Strip moves UP).
            // Start: Low Index (Current) -> End: High Index (Future)

            // 1. Determine Start Position (Current View)
            // Let's say we are currently at index 2 (viewing item 2)
            // We want to spin to index 12 (viewing match).
            // Strip moves from -2*H to -12*H. (More negative = Moves Up).

            const LOOP_TARGET = 10; // Target deeply into the list
            const targetIndex = (LOOP_TARGET * prizes.length) + winIndex;
            const targetOffset = targetIndex * ITEM_SIZE;

            // Start from where we roughly are (or a standard reset point)
            // For visual continuity, we can jump to a modulo position if needed, 
            // but simply animating from "Current Low" to "Target High" works best for "Spinning away".
            const startOffset = (2 * prizes.length) * ITEM_SIZE;

            // Instant Reset to start position (invisible jump if items match)
            if (stripRef.current) {
                stripRef.current.style.transform = `translate3d(0, -${startOffset}px, 0)`;
            }

            // Start Animation
            animateScroll(startOffset, targetOffset, 4000, () => {
                setIsSpinning(false);
                onSpinEnd();
            });

        } else if (!spinning) {
            // Idle Mode setup
            // Reset to an initial position for the next spin? 
            // Or just stay where we are?
            // Since we won, we are at `targetOffset`. 
        }
    }, [spinning, winIndex, prizes.length, ITEM_SIZE, onSpinEnd]);

    // Initial Setup
    useEffect(() => {
        if (prizes.length > 0 && stripRef.current) {
            // Set initial visible state (e.g., 2nd set of prizes)
            const initialOffset = (2 * prizes.length) * ITEM_SIZE;
            stripRef.current.style.transform = `translate3d(0, -${initialOffset}px, 0)`;
        }
    }, [prizes.length, ITEM_SIZE]);


    return (
        <div className="w-full h-full relative overflow-hidden flex justify-center transform-gpu">
            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FF4500] via-[#FF4500]/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FF6000] via-[#FF6000]/90 to-transparent z-10 pointer-events-none" />

            {/* Spin Indicators */}
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

            {/* Background Pattern */}
            <div
                className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${spinning ? 'opacity-30' : 'opacity-0'}`}
                style={{
                    background: `linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 10%, transparent 20%)`,
                    backgroundSize: '100% 200%'
                }}
            />

            {/* SCROLL STRIP - Controlled by ref (no React State for transform) */}
            <div
                ref={stripRef}
                className="flex flex-col items-center absolute w-full will-change-transform"
                style={{
                    top: '50%',
                    marginTop: -CARD_HEIGHT / 2,
                    // transform is assigned via JS directly
                    gap: GAP,
                    backfaceVisibility: 'hidden',
                    perspective: 1000,
                    transformStyle: 'preserve-3d',
                }}
            >
                {extendedPrizes.map((prize, i) => (
                    <div
                        key={`${prize.id}-${i}`}
                        className="flex-shrink-0 relative transition-transform duration-300 transform"
                        style={{ width: '85%', height: CARD_HEIGHT }}
                    >
                        {/* Card Design */}
                        <div className={`
                            w-full h-full rounded-3xl flex items-center justify-between px-8 relative overflow-hidden
                            ${i % 2 === 0 ? 'bg-[#ff5500]' : 'bg-[#ff6600]'} 
                            shadow-[0_8px_0_rgba(0,0,0,0.15)] 
                        `}>
                            {/* Dynamic Blurs: Only show when NOT spinning */}
                            <div className={`absolute top-[-20%] left-[-10%] w-20 h-20 bg-white/10 rounded-full ${isSpinning ? '' : 'blur-xl'} transition-all duration-300`} />
                            <div className={`absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full ${isSpinning ? '' : 'blur-xl'} transition-all duration-300`} />

                            {/* Prize Value */}
                            <div className="text-white z-10">
                                {prize.type === 'coupon' ? (
                                    <div className="text-6xl font-black italic drop-shadow-sm tracking-tighter">{prize.value}</div>
                                ) : prize.type === 'physical' ? (
                                    <div className="text-4xl font-black italic drop-shadow-sm">iPhone 15</div>
                                ) : (
                                    <div className="text-6xl font-black italic drop-shadow-sm flex items-baseline">
                                        {prize.value}<span className="text-4xl ml-1">₽</span>
                                    </div>
                                )}
                                <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 ml-1">{prize.name}</div>
                            </div>

                            {/* Icon */}
                            <div className={`w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border border-white/20 shadow-inner z-10 ${isSpinning ? '' : 'backdrop-blur-sm'} transition-all duration-300`}>
                                <span className="text-4xl">🎁</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
