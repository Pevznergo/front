'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { sendGTMEvent } from '@/lib/gtm'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="font-bold text-white text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Aporto</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-gray-300 hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('why-it-works')} className="text-sm text-gray-300 hover:text-white transition-colors">Why It Works</button>
            <button onClick={() => scrollToSection('segments')} className="text-sm text-gray-300 hover:text-white transition-colors">Who We Help</button>

            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'navigation', label: 'start_recovering_revenue' })
                window.dispatchEvent(new CustomEvent('openBookingModal'))
              }}
              className="glass-button px-5 py-2.5 rounded-full text-sm font-medium text-white hover:bg-white/15 border border-white/10 shadow-[0_0_15px_rgba(0,122,255,0.3)] hover:shadow-[0_0_25px_rgba(0,122,255,0.5)] transition-all"
            >
              Start Recovering Revenue
            </button>
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-4 bg-black/90 backdrop-blur-xl absolute top-20 left-0 w-full px-4 border-b border-white/10">
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-gray-300 hover:text-white">How it Works</button>
            <button onClick={() => scrollToSection('why-it-works')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Why It Works</button>
            <button onClick={() => scrollToSection('segments')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Who We Help</button>
            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'mobile_menu', label: 'start_recovering_revenue' })
                window.dispatchEvent(new CustomEvent('openBookingModal'))
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium mt-2"
            >
              Start Recovering Revenue
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
