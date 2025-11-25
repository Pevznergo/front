'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import BookingModal from '@/components/BookingModal'
import Partners from '@/components/Partners'
import MatchGameModal from '@/components/vibeflow/MatchGameModal'
import { sendGTMEvent } from '@/lib/gtm'
import { Check, Users, TrendingUp, Zap, ArrowRight, Heart, ShoppingCart, Briefcase, Gift, Mail, CreditCard, ChevronUp, ChevronDown } from 'lucide-react'

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isMatchGameOpen, setIsMatchGameOpen] = useState(false)

  useEffect(() => {
    const handleOpenBooking = () => setIsBookingModalOpen(true)
    window.addEventListener('openBookingModal', handleOpenBooking)
    return () => window.removeEventListener('openBookingModal', handleOpenBooking)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white selection:bg-pink-500/30">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-pink-600/20 to-transparent opacity-50 blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-300">The "Tinder for SaaS" Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Turn Your Dead Leads into <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">"Power Couples".</span>
          </h1>

          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Reactivate your churned users by bundling your SaaS with the tools they already love (Canva, CapCut, etc.). Run a "Don't Let Your App Be Single" campaign and unlock revenue through exclusive partner matches.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'hero', label: 'start_matching' })
                setIsBookingModalOpen(true)
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Launch Your Campaign
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">For SaaS Founders • Growth Teams • Partnerships</p>
        </div>

        <div className="mt-16">
          <Partners />
        </div>
      </section>

      {/* DEMO SECTION (The User Experience) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-pink-900/10 to-black pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See What Your Users Experience</h2>
            <p className="text-gray-400 mb-8">Your users swipe to find their perfect partner tool. Try it yourself.</p>

            <div
              onClick={() => setIsMatchGameOpen(true)}
              className="relative w-64 h-96 mx-auto cursor-pointer group perspective-1000"
            >
              <div className="relative w-full h-full transition-all duration-500 transform group-hover:scale-105 group-hover:rotate-1 shadow-2xl rounded-3xl overflow-hidden border-4 border-white/10">
                <Image
                  src="/logos/canva.png"
                  alt="Canva"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-left">
                  <div className="inline-block px-3 py-1 mb-2 bg-pink-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-lg">
                    Design Wizard
                  </div>
                  <h3 className="text-2xl font-black text-white drop-shadow-lg">Canva</h3>
                  <p className="text-white/80 text-sm mt-1">Click to match</p>
                </div>

                {/* Play/Action Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    <Heart className="w-8 h-8 text-white fill-current animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" />
            </div>
          </div>

          <MatchGameModal
            isOpen={isMatchGameOpen}
            onClose={() => setIsMatchGameOpen(false)}
          />
        </div>
      </section>

      {/* HOW IT WORKS (The B2B2C Flow) */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">How the <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Platform</span> Works.</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We provide the infrastructure to bundle your product with top-tier SaaS partners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "The Hook",
                desc: "You send a campaign (Email or In-App) to your lost leads: \"Don't Let [Your App] Be Single\". It's intriguing and different.",
                icon: <Mail className="w-6 h-6 text-pink-400" />
              },
              {
                step: "02",
                title: "The Match",
                desc: "Users land on a branded matching page. They swipe to find a complementary tool (e.g., Your CRM + An Email Tool) with a 50% discount.",
                icon: <Heart className="w-6 h-6 text-red-500" />
              },
              {
                step: "03",
                title: "The Bundle",
                desc: "They pay ONE single bill for both apps. We handle the split payments and provision access instantly. Frictionless.",
                icon: <CreditCard className="w-6 h-6 text-orange-400" />
              }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl relative group hover:bg-white/10 transition-all duration-300">
                <div className="absolute top-8 right-8 opacity-10 text-6xl font-bold">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION (Why SaaS Companies Use Us) */}
      <section id="why-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">The Ultimate Growth Hack</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Reactivation",
                desc: "Win back dead leads who churned on price. A 50% bundle discount makes your product a 'no-brainer' again.",
                icon: <Zap className="w-6 h-6 text-yellow-400" />
              },
              {
                title: "Acquisition",
                desc: "Get discovered by users of other apps. When Canva users swipe, they find YOU. It's free exposure to high-intent leads.",
                icon: <TrendingUp className="w-6 h-6 text-green-400" />
              },
              {
                title: "Retention",
                desc: "Sticky ecosystem. Users who have 2+ integrated tools churn 70% less than single-tool users.",
                icon: <Check className="w-6 h-6 text-blue-400" />
              }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl hover:border-white/20 transition-colors">
                <div className="mb-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE HELP */}
      <section id="segments" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Join the Ecosystem</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "For CRM Tools",
                desc: "Partner with Email & Automation tools.",
                icon: <Users className="w-6 h-6 text-pink-400" />
              },
              {
                title: "For Design Tools",
                desc: "Partner with Social Media & Video tools.",
                icon: <Zap className="w-6 h-6 text-blue-400" />
              },
              {
                title: "For E-commerce",
                desc: "Partner with Reviews & Upsell tools.",
                icon: <ShoppingCart className="w-6 h-6 text-purple-400" />
              }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center hover:scale-105 transition-transform duration-300">
                <div className="mb-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE NUMBERS / FOOTER CTA */}
      <section id="calculator" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">The Math is Simple.</h2>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
            <div className="p-4">
              <div className="text-3xl font-bold text-white mb-1">$0</div>
              <div className="text-sm text-gray-400">Your Cost per Lead</div>
            </div>
            <div className="p-4 border-x border-white/10">
              <div className="text-3xl font-bold text-blue-400 mb-1">%</div>
              <div className="text-sm text-gray-400">Our Fee (Recovered Revenue Only)</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-400 mb-1">Zero</div>
              <div className="text-sm text-gray-400">Your Risk</div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl max-w-xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Your Database is leaking revenue every day.</h3>
            <p className="text-gray-400 mb-8">Let’s plug the hole.</p>

            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'footer', label: 'get_revenue_forecast' })
                setIsBookingModalOpen(true)
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            >
              Get a Revenue Recovery Forecast
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Aporto. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="/data-processing-agreement" className="text-gray-500 hover:text-white text-sm transition-colors">Data Processing Agreement</a>
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