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
    <nav className="fixed top-0 w-full z-50 border-b border-gray-200/50 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="font-bold text-white text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Aporto</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('why-it-works')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Why It Works</button>
            <button onClick={() => scrollToSection('segments')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Who We Help</button>

            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'navigation', label: 'start_recovering_revenue' })
                window.dispatchEvent(new CustomEvent('openBookingModal'))
              }}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Recovering Revenue
            </button>
          </div>

          <button
            className="md:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-4 bg-white/90 backdrop-blur-xl absolute top-20 left-0 w-full px-4 border-b border-gray-200/50 shadow-xl">
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 font-medium">How it Works</button>
            <button onClick={() => scrollToSection('why-it-works')} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 font-medium">Why It Works</button>
            <button onClick={() => scrollToSection('segments')} className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 font-medium">Who We Help</button>
            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'mobile_menu', label: 'start_recovering_revenue' })
                window.dispatchEvent(new CustomEvent('openBookingModal'))
              }}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-bold mt-2 shadow-lg"
            >
              Start Recovering Revenue
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
