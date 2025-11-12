'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-sm z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold gradient-text">Aporto</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Join waitlist
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full mt-4"
            >
              Try Aporto
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
