'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Zap, Wallet, Rocket, Heart, X } from 'lucide-react'
import MatchModal from '@/components/vibeflow/MatchModal'

interface Tariff {
    id: number
    name: string
    price: number
    original_price: number
    features: string
    type: string
}

interface Partner {
    id: number
    name: string
    role: string
    age: string
    bio: string
    looking_for: string
    discount: string
    logo: string
    tariffs: Tariff[]
}

export default function VibeflowPage() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [loading, setLoading] = useState(true)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

    useEffect(() => {
        async function fetchPartners() {
            try {
                const res = await fetch('/api/partners')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setPartners(data)
                }
            } catch (error) {
                console.error('Failed to fetch partners:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPartners()
    }, [])

    const handlePass = () => {
        setCurrentCardIndex(prev => (prev + 1) % partners.length)
    }

    const handleLike = () => {
        setSelectedPartner(currentCard)
        setIsMatchModalOpen(true)
    }

    const currentCard = partners[currentCardIndex]

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-900 selection:bg-purple-200">

            {/* HERO + INTERACTIVE MATCHER - Two Column Layout */}
            <section className="min-h-screen flex items-center justify-center px-6 py-20">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* LEFT: Partner Card in 9/16 Format - iOS Style */}
                        <div className="flex justify-center lg:justify-end">
                            {loading ? (
                                <div className="text-center text-gray-600 font-medium">Loading partners...</div>
                            ) : partners.length === 0 ? (
                                <div className="text-center text-gray-600 font-medium">No partners found.</div>
                            ) : (
                                <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
                                    style={{
                                        width: 'min(calc(85vh * 9 / 16), calc(100vw - 4rem))',
                                        aspectRatio: '9/16'
                                    }}>
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={currentCard.logo}
                                            alt={currentCard.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                                    </div>

                                    {/* Discount Badge - iOS Style with Animation */}
                                    <div className="absolute top-6 right-6 z-10">
                                        <div className="relative">
                                            {/* Pulsing glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
                                            {/* Main badge */}
                                            <div className="relative bg-gradient-to-br from-pink-500 to-orange-500 text-white px-5 py-2.5 rounded-full font-black text-base shadow-2xl border-2 border-white/50 animate-[bounce_2s_ease-in-out_infinite]">
                                                {currentCard.discount}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Partner Info Overlay - iOS Frosted Glass */}
                                    <div className="absolute bottom-6 left-6 right-6 z-10">
                                        <div className="bg-white/15 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                                            <div className="mb-4">
                                                <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                                    {currentCard.name}
                                                </h3>
                                                <p className="text-white/80 text-base font-medium mb-1">
                                                    {currentCard.age}
                                                </p>
                                                <p className="text-white/90 text-sm leading-relaxed mb-3 line-clamp-3">
                                                    {currentCard.bio}
                                                </p>
                                            </div>

                                            {/* Action Buttons - iOS Style */}
                                            <div className="flex justify-center gap-5 pt-4">
                                                <button
                                                    onClick={handlePass}
                                                    className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
                                                    aria-label="Pass"
                                                >
                                                    <X className="w-7 h-7 text-white stroke-[2.5]" />
                                                </button>
                                                <button
                                                    onClick={handleLike}
                                                    className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-pink-300/50 hover:from-pink-600 hover:to-pink-700 hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl"
                                                    aria-label="Like"
                                                >
                                                    <Heart className="w-7 h-7 text-white fill-current" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Text Content - iOS Typography */}
                        <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
                            <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight">
                                Don't Let Vibeflow<br />Be Single.
                            </h1>
                            <p className="text-xl md:text-2xl font-medium text-gray-700 max-w-lg leading-relaxed">
                                Your tech stack works better in pairs. Match Vibeflow with a partner app and unlock an exclusive 40% "Power Couple" Discount.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY DATE US SECTION - iOS Card Style */}
            <section className="bg-white/80 backdrop-blur-xl py-28 px-6 rounded-t-[3rem] -mt-12 relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.08)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Why this relationship works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                                <Zap className="w-10 h-10 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Seamless Integration</h3>
                            <p className="text-gray-600 leading-relaxed">Our tools are pre-configured to work together instantly. No complex setup or developer needed.</p>
                        </div>

                        <div className="text-center bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                                <Wallet className="w-10 h-10 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Smart Savings</h3>
                            <p className="text-gray-600 leading-relaxed">Unlock significant discounts when you bundle. Save up to thousands annually on your tech stack.</p>
                        </div>

                        <div className="text-center bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                                <Rocket className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Zero Friction</h3>
                            <p className="text-gray-600 leading-relaxed">One click to connect, one bill to pay. Simplify your operations and focus on growth.</p>
                        </div>
                    </div>

                    {/* Enterprise / Custom Bundle CTA */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">Need a bigger relationship?</h3>
                            <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
                                Want to bundle multiple apps or need custom enterprise terms? Our sales team is ready to build the perfect package for you.
                            </p>
                            <a
                                href="mailto:support@aporto.tech"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                            >
                                Contact Sales Team
                            </a>
                            <p className="mt-4 text-sm text-gray-400">
                                or email us at <span className="text-white font-medium">support@aporto.tech</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER - iOS Minimal Style */}
            <footer className="bg-white/50 backdrop-blur-xl py-16 text-center border-t border-gray-200/50">
                <p className="text-gray-600 mb-5 text-lg font-medium">Still want to be single?</p>
                <button className="text-gray-500 hover:text-gray-700 text-sm font-medium underline decoration-dotted underline-offset-4 transition-colors">
                    No thanks, I hate saving money. Take me to standard checkout.
                </button>
                <p className="text-gray-400 text-xs mt-8 font-medium">Powered by Aporto.tech | The SaaS Matchmaker</p>
            </footer>

            {/* Match Modal for Tariff Selection */}
            {selectedPartner && (
                <MatchModal
                    isOpen={isMatchModalOpen}
                    onClose={() => setIsMatchModalOpen(false)}
                    partner={selectedPartner}
                />
            )}
        </main>
    )
}
