'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AudioDemo from '@/components/AudioDemo'
import BookingModal from '@/components/BookingModal'
import { sendGTMEvent } from '@/lib/gtm'
import { Check, ChevronDown, ChevronUp, Shield, Users, TrendingUp, Zap, ArrowRight, Phone, ShoppingCart, Briefcase } from 'lucide-react'

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    const handleOpenBooking = () => setIsBookingModalOpen(true)
    window.addEventListener('openBookingModal', handleOpenBooking)
    return () => window.removeEventListener('openBookingModal', handleOpenBooking)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-600/20 to-transparent opacity-50 blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-300">Performance-based pricing. We only earn when you get paid.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            We Close <br className="hidden sm:block" />
            <span className="ios-gradient-text">the Deals You Lost.</span>
          </h1>

          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Stop letting your "Dead Leads" and "Cancelled Subscriptions" gather dust. We act as your dedicated Win-Back Sales Team. Our AI Agents call your unconverted contacts, overcome their objections with exclusive bundles, and resell your product for you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                sendGTMEvent({ event: 'cta_click', location: 'hero', label: 'start_recovering_revenue' })
                setIsBookingModalOpen(true)
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Start Recovering Revenue
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Targeting: Churned Users • Expired Trials • Cold Leads</p>
        </div>
      </section>

      {/* THE REALITY CHECK (Agitation) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">You’re Sitting on a Goldmine of <br /><span className="text-yellow-500">"Almost"</span> Customers.</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              You paid huge CAC to get them. They visited, they signed up for a trial, or they bought once... and then they left.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Lost Leads", desc: "Qualified prospects who said 'No' to the price.", icon: <TrendingUp className="w-6 h-6 text-red-400" /> },
              { title: "Churned Clients", desc: "Users who left due to budget cuts.", icon: <Users className="w-6 h-6 text-orange-400" /> },
              { title: "Ghosted Trials", desc: "People who signed up and never bought.", icon: <Briefcase className="w-6 h-6 text-gray-400" /> }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl text-center hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-400">
            <p>Your sales team has moved on to fresh leads. Your automated emails are going to Spam.</p>
            <p className="mt-2 font-medium text-white">But they still need a solution. They just needed a better offer or a personal touch.</p>
          </div>
        </div>
      </section>

      {/* OUR PROPOSITION (The "We Sell For You" Angle) */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Think of Us as Your <br /><span className="ios-gradient-blue">"Second Chance"</span> Sales Force.</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We don't just send reminders. We actively sell your product to the people who slipped through the cracks. We use a combination of empathetic AI Voice Agents and irresistible "Cross-Brand Bundles" to turn a "No" into a "Yes."
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "We Pick Up Where You Left Off",
                desc: "We securely ingest your list of lost leads and churned users. We identify why they didn't buy (Price? Timing? Competitor?).",
                icon: <Users className="w-6 h-6 text-blue-400" />
              },
              {
                step: "02",
                title: "We Pitch a Better Offer",
                desc: "Selling the same thing at the same price won't work. We package your product with complementary non-competing tools to create a no-brainer deal.",
                icon: <Zap className="w-6 h-6 text-purple-400" />
              },
              {
                step: "03",
                title: "We Close the Sale via AI",
                desc: "Our AI agents call them personally. They negotiate, handle objections, and close the subscription on your behalf.",
                icon: <Phone className="w-6 h-6 text-green-400" />
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

      {/* AUDIO DEMO SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/10 to-black pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Hear the Difference. <br />Real-Time AI Conversation.</h2>
            <p className="text-gray-400">Click play to hear how our AI handles a reactivation call.</p>
          </div>

          <AudioDemo />
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section id="why-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Why Our "Win-Back" Approach <br />Succeeds Where Emails Fail</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Active Selling, Not Passive Waiting",
                desc: "We call. We talk. We persuade. We don't wait for them to open an email.",
                icon: <Phone className="w-6 h-6 text-blue-400" />
              },
              {
                title: "The \"Better Than New\" Offer",
                desc: "By bundling your product with partners, we increase the value proposition without devaluing your brand. The lead feels they are getting an exclusive \"Insider Deal.\"",
                icon: <Zap className="w-6 h-6 text-yellow-400" />
              },
              {
                title: "Instant Objection Handling",
                desc: "\"Too expensive?\" — We have a bundle discount. \"Not needed now?\" — We have a flexible reactivation plan. Our AI handles these objections in real-time.",
                icon: <Check className="w-6 h-6 text-green-400" />
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
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Tailored for High-Growth B2B SaaS</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "E-commerce Apps",
                desc: "Reactivate shop owners who uninstalled your plugin.",
                icon: <ShoppingCart className="w-6 h-6 text-pink-400" />
              },
              {
                title: "Marketing Tools",
                desc: "Convert freelancers who expired their free trial.",
                icon: <TrendingUp className="w-6 h-6 text-blue-400" />
              },
              {
                title: "HR & Recruitment Tech",
                desc: "Win back companies that froze hiring budgets.",
                icon: <Users className="w-6 h-6 text-purple-400" />
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