'use client'

import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnhanceOpen, setIsEnhanceOpen] = useState(false)

  const enhanceItems = [
    'Unblur & Sharpener',
    'Denoiser',
    'Old Photos Restorer',
    'Image Enlarger',
    'Color Fixer',
    'Face Enhancer',
    'Background Enhancer',
    'Low Quality Enhancer',
    'Video Enhancer',
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold gradient-text">Aporto</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Support
            </a>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Try Aporto
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
            <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">
              Support
            </a>
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
