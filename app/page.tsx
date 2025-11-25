'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import BookingModal from '@/components/BookingModal'
import Partners from '@/components/Partners'
import PartnerSwiper from '@/components/vibeflow/PartnerSwiper'
import { sendGTMEvent } from '@/lib/gtm'
import { Check, Users, TrendingUp, Zap, ArrowRight, Heart, ShoppingCart, Briefcase, Gift, Mail, CreditCard, ChevronUp, ChevronDown } from 'lucide-react'

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [displayDiscount, setDisplayDiscount] = useState('40%')

  useEffect(() => {
    const handleOpenBooking = () => setIsBookingModalOpen(true)
    window.addEventListener('openBookingModal', handleOpenBooking)
    return () => window.removeEventListener('openBookingModal', handleOpenBooking)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-900 selection:bg-purple-200">
      <Navigation />

      {/* HERO SECTION - Two Column Layout */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: Text Content */}
            <div className="flex flex-col justify-center space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 w-fit mx-auto lg:mx-0 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">The "Tinder for SaaS" Platform</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                Turn Your Dead Leads into <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">"Power Couples".</span>
              </h1>

              <p className="text-xl font-medium text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Reactivate your churned users by bundling your SaaS with the tools they already love. Run a "Don't Let Your App Be Single" campaign and unlock revenue through exclusive partner matches.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Launch Your Campaign
                </button>
                <p className="text-sm text-gray-500 font-medium">For SaaS Founders • Growth Teams</p>
              </div>
            </div>

            {/* RIGHT: Interactive Partner Swiper */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <PartnerSwiper onDiscountChange={setDisplayDiscount} />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (The B2B2C Flow) */}
      <section id="how-it-works" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-gray-900">How the <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Platform</span> Works.</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              We provide the infrastructure to bundle your product with top-tier SaaS partners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "The Hook",
                desc: "You send a campaign (Email or In-App) to your lost leads: \"Don't Let [Your App] Be Single\". It's intriguing and different.",
                icon: <Mail className="w-8 h-8 text-pink-600" />
              },
              {
                step: "02",
                title: "The Match",
                desc: "Users land on a branded matching page. They swipe to find a complementary tool (e.g., Your CRM + An Email Tool) with a 50% discount.",
                icon: <Heart className="w-8 h-8 text-pink-500" />
              },
              {
                step: "03",
                title: "The Bundle",
                desc: "They pay ONE single bill for both apps. We handle the split payments and provision access instantly. Frictionless.",
                icon: <CreditCard className="w-8 h-8 text-orange-600" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute top-4 right-6 opacity-10 text-8xl font-black text-gray-900 -z-10">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION (Why SaaS Companies Use Us) */}
      <section id="why-it-works" className="py-24 px-6 bg-white/40 backdrop-blur-lg rounded-[3rem] mx-4 mb-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-center mb-16 tracking-tight text-gray-900">The Ultimate Growth Hack</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Reactivation",
                desc: "Win back dead leads who churned on price. A 50% bundle discount makes your product a 'no-brainer' again.",
                icon: <Zap className="w-8 h-8 text-yellow-500" />
              },
              {
                title: "Acquisition",
                desc: "Get discovered by users of other apps. When Canva users swipe, they find YOU. It's free exposure to high-intent leads.",
                icon: <TrendingUp className="w-8 h-8 text-green-500" />
              },
              {
                title: "Retention",
                desc: "Sticky ecosystem. Users who have 2+ integrated tools churn 70% less than single-tool users.",
                icon: <Check className="w-8 h-8 text-blue-500" />
              }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl hover:bg-white/50 transition-colors">
                <div className="mb-6 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE NUMBERS / FOOTER CTA */}
      <section id="calculator" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black mb-8 text-gray-900 tracking-tight">The Math is Simple.</h2>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-16 bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="p-4">
              <div className="text-4xl font-black text-gray-900 mb-2">$0</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Your Cost per Lead</div>
            </div>
            <div className="p-4 border-x border-gray-200">
              <div className="text-4xl font-black text-blue-600 mb-2">%</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Our Fee (Recovered Revenue Only)</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-black text-green-500 mb-2">Zero</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Your Risk</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-12 rounded-[2.5rem] max-w-3xl mx-auto text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Your Database is leaking revenue every day.</h3>
              <p className="text-gray-300 mb-10 text-lg">Let’s plug the hole.</p>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-white text-gray-900 font-bold py-5 rounded-2xl text-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Get a Revenue Recovery Forecast
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-gray-200/50 bg-white/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Aporto. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Privacy Policy</a>
            <a href="/data-processing-agreement" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Data Processing Agreement</a>
          </div>
        </div>
      </footer>

      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </main>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-lg">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-400 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
          {answer}
        </div>
      )}
    </div>
  )
}