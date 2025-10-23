'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import BeforeAfter from '@/components/BeforeAfter'
import HeroSlider from '@/components/HeroSlider'
import FeatureCard from '@/components/FeatureCard'
import AuthModal from '@/components/AuthModal'
import { Sparkles, Image, Palette, Focus, Video, Wand2 } from 'lucide-react'

type PhotoType = 'portrait' | 'landscape' | 'old'

export default function Home() {
  const [activeTab, setActiveTab] = useState<PhotoType>('portrait')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true)
    window.addEventListener('openAuthModal', handleOpenAuth)
    return () => window.removeEventListener('openAuthModal', handleOpenAuth)
  }, [])

  const photoData = {
    portrait: {
      before: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&blur=50',
      after: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop'
    },
    landscape: {
      before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&h=800&fit=crop&blur=50',
      after: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&h=800&fit=crop'
    },
    old: {
      before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop&blur=40&grayscale',
      after: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop'
    }
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            The only photo and video
            <br />
            <span className="gradient-text">enhancer you'll ever need</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transformative technology gives your low-quality visuals a stunning HD upgrade. 
            Restore old photos to incredible detail and elevate your content to a professional level.
          </p>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all hover:scale-105"
          >
            Try Aporto Now
          </button>
        </div>

        {/* Hero Image Tabs */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              onClick={() => setActiveTab('portrait')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'portrait' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Portrait
            </button>
            <button 
              onClick={() => setActiveTab('landscape')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'landscape' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Landscape
            </button>
            <button 
              onClick={() => setActiveTab('old')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'old' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Old Photo
            </button>
          </div>

          <HeroSlider
            key={activeTab}
            beforeImage={photoData[activeTab].before}
            afterImage={photoData[activeTab].after}
          />

          {/* Feature Tags */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-lg p-4 shadow-md text-center">
              <p className="text-xs text-indigo-600 font-semibold mb-1">Face Enhance</p>
              <p className="text-xs text-gray-600">Increase quality of faces</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md text-center">
              <p className="text-xs text-indigo-600 font-semibold mb-1">Face Glow</p>
              <p className="text-xs text-gray-600">Give people a new look and feel</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md text-center">
              <p className="text-xs text-indigo-600 font-semibold mb-1">Auto Color</p>
              <p className="text-xs text-gray-600">Adjust and improve colors</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md text-center">
              <p className="text-xs text-indigo-600 font-semibold mb-1">Background Enhance</p>
              <p className="text-xs text-gray-600">Increase quality of every detail</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-indigo-600 font-semibold mb-2 uppercase tracking-wide">Industries</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              One product, endless business possibilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge AI revolutionizes the process of enhancing visuals, making it more efficient than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-white" />}
              title="Face Enhance"
              description="Increase quality of faces with advanced AI technology"
            />
            <FeatureCard
              icon={<Wand2 className="w-6 h-6 text-white" />}
              title="Face Glow"
              description="Give people a new look and feel with natural enhancements"
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6 text-white" />}
              title="Auto Color"
              description="Adjust and improve colors and tones automatically"
            />
            <FeatureCard
              icon={<Image className="w-6 h-6 text-white" />}
              title="Background Enhance"
              description="Increase the quality of every detail in the background"
            />
            <FeatureCard
              icon={<Focus className="w-6 h-6 text-white" />}
              title="Unblur & Sharpen"
              description="Remove blur and make your images crystal clear"
            />
            <FeatureCard
              icon={<Video className="w-6 h-6 text-white" />}
              title="Video Enhancer"
              description="Enhance and enlarge your videos with AI power"
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-indigo-600 font-semibold mb-4 uppercase tracking-wide">Our Users</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            "Look at the before and after. If this doesn't blow your mind, I don't know what will! 
            This is absolute magic!"
          </h2>
          <p className="text-lg text-gray-600">
            <a href="#" className="text-indigo-600 hover:underline">@PiXimperfect - Unmesh Dinda</a>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Try Aporto now!
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join the Aporto community today and discover the transformative power of cutting-edge AI technology for yourself.
          </p>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-white text-indigo-600 px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Enhance</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Unblur & Sharpener</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Denoiser</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Old Photos Restorer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Image Enlarger</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Color Fixer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">More Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Face Enhancer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Background Enhancer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Low Quality Enhancer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Video Enhancer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">AI Photos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Try Aporto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Web Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">App Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>© 2024 AI Creativity S.r.l. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </main>
  )
}
