'use client'

import { useState, useEffect } from 'react'
import { X, Heart, Check, CreditCard, ShieldCheck } from 'lucide-react'
import CheckoutModal from './CheckoutModal'

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
    logo: string
    tariffs: Tariff[]
}

interface MatchModalProps {
    isOpen: boolean
    onClose: () => void
    partner: Partner
}

export default function MatchModal({ isOpen, onClose, partner }: MatchModalProps) {
    const [platformTariffs, setPlatformTariffs] = useState<Tariff[]>([])
    const [bundles, setBundles] = useState<any[]>([])
    const [selectedBundleIndex, setSelectedBundleIndex] = useState<number>(0)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetch('/api/tariffs/platform')
                .then(res => res.json())
                .then(data => setPlatformTariffs(data))
                .catch(err => console.error('Failed to fetch platform tariffs:', err))
        }
    }, [isOpen])

    // Generate bundles when tariffs are loaded
    useEffect(() => {
        if (platformTariffs.length > 0 && partner?.tariffs?.length > 0) {
            const generatedBundles = []

            // Sort tariffs by price to ensure logical pairing
            const sortedPlatform = [...platformTariffs].sort((a, b) => Number(a.price) - Number(b.price))
            const sortedPartner = [...partner.tariffs].sort((a, b) => Number(a.price) - Number(b.price))

            // Determine how many bundles to create based on the side with more tariffs
            const maxBundles = Math.max(sortedPlatform.length, sortedPartner.length)

            for (let i = 0; i < maxBundles; i++) {
                // If one side runs out of tariffs, reuse the last one (or the only one)
                // This handles 1-to-N relationships correctly
                const platformTariff = sortedPlatform[i] || sortedPlatform[sortedPlatform.length - 1]
                const partnerTariff = sortedPartner[i] || sortedPartner[sortedPartner.length - 1]

                if (platformTariff && partnerTariff) {
                    generatedBundles.push({
                        id: `bundle-${i}`,
                        name: i === 0 ? 'Starter Bundle' : 'Pro Bundle', // Simplified naming for now, could be dynamic
                        price: Number(platformTariff.price) + Number(partnerTariff.price),
                        originalPrice: Number(platformTariff.original_price) + Number(partnerTariff.original_price),
                        items: [
                            { source: 'Vibeflow', plan: platformTariff.name },
                            { source: partner.name, plan: partnerTariff.name }
                        ],
                        isPopular: i === 1 // Mark second bundle as popular if it exists
                    })
                }
            }

            setBundles(generatedBundles)
            // Default to the "popular" bundle (index 1) if it exists, otherwise 0
            setSelectedBundleIndex(generatedBundles.length > 1 ? 1 : 0)
        }
    }, [platformTariffs, partner])

    if (!isOpen || !partner) return null

    const selectedBundle = bundles[selectedBundleIndex]

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-black rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col" style={{ height: 'min(80vh, calc((100vw - 2rem) * 16 / 9))', aspectRatio: '9/16' }}>
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-full h-full object-cover opacity-80 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </div>

                    {/* Close Button */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-2 transition-all">
                        <X className="w-6 h-6" />
                    </button>

                    {/* Content Overlay */}
                    <div className="relative z-10 mt-auto p-6 flex flex-col h-full justify-end overflow-y-auto">

                        {/* Header Section */}
                        <div className="text-center mb-6">
                            <h2 className="text-4xl font-black italic text-white mb-2 drop-shadow-lg">IT'S A MATCH!</h2>
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-pink-500 font-bold text-lg shadow-lg border-2 border-pink-500">You</div>
                                <Heart className="w-8 h-8 fill-pink-500 text-pink-500 animate-pulse" />
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-orange-500 font-bold text-lg shadow-lg border-2 border-orange-500">
                                    {partner.name.charAt(0)}
                                </div>
                            </div>
                            <p className="mt-3 font-medium text-white/90 drop-shadow-md">Unlock the "Power Couple" Bundle</p>
                        </div>

                        {/* Pricing Options */}
                        <div className="space-y-3 mb-4">
                            {bundles.map((bundle, index) => (
                                <div
                                    key={bundle.id}
                                    onClick={() => setSelectedBundleIndex(index)}
                                    className={`border rounded-xl p-4 relative cursor-pointer transition-all backdrop-blur-md ${selectedBundleIndex === index ? 'border-pink-500 bg-pink-500/20' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
                                >
                                    {bundle.isPopular && selectedBundleIndex === index && (
                                        <div className="absolute -top-3 right-4 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">{bundle.name}</span>
                                        <span className="font-bold text-pink-400">${bundle.price}/mo <span className="text-white/40 text-sm font-normal line-through">${bundle.originalPrice}</span></span>
                                    </div>
                                    <ul className="text-xs text-gray-300 space-y-1">
                                        {bundle.items.map((item: any, i: number) => (
                                            <li key={i} className="flex items-center gap-1">
                                                <Check className="w-3 h-3 text-green-400" />
                                                <span className="font-semibold text-white/90">{item.source}:</span> {item.plan}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mb-2"
                            disabled={!selectedBundle}
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay & Unlock Both Apps
                        </button>

                        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Secure Unified Billing via Stripe</span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedBundle && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    bundleName={selectedBundle.name}
                    price={selectedBundle.price}
                    partnerName={partner.name}
                />
            )}
        </>
    )
}
