'use client'

import { X } from 'lucide-react'

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl h-[80vh] bg-[#18181b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-semibold text-white">Book a Conversation</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Iframe Container */}
                <div className="flex-1 w-full h-full bg-white">
                    <iframe
                        src="https://calendar.app.google/Rsh5hbc8fVBu2jYi7"
                        className="w-full h-full border-0"
                        title="Book a call with Aporto"
                    />
                </div>
            </div>
        </div>
    )
}
