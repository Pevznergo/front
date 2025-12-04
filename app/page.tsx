'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import BookingModal from '@/components/BookingModal'
import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import ValueProp from '@/components/ValueProp'
import Catalog from '@/components/Catalog'
import { sendGTMEvent } from '@/lib/gtm'
import { ArrowRight, ChevronUp, ChevronDown, CheckCircle2, Share2, Unlock } from 'lucide-react'

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    const handleOpenBooking = () => setIsBookingModalOpen(true)
    window.addEventListener('openBookingModal', handleOpenBooking)
    return () => window.removeEventListener('openBookingModal', handleOpenBooking)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Navigation />

      <Hero />
      <Ticker />
      <ValueProp />
      <Catalog />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-white">
              Zero Friction <span className="text-gray-500">Setup</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Partner with Us",
                desc: "Apply to get a dedicated perks portal for your community.",
                icon: <CheckCircle2 className="w-8 h-8 text-blue-400" />
              },
              {
                step: "02",
                title: "Share with Members",
                desc: "Post the link in your Skool, Discord, or Slack \"Resources\" channel.",
                icon: <Share2 className="w-8 h-8 text-purple-400" />
              },
              {
                step: "03",
                title: "Unlock Savings",
                desc: "Your members get instant access to verify their status and redeem codes.",
                icon: <Unlock className="w-8 h-8 text-green-400" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-all">
                <div className="absolute top-4 right-6 opacity-10 text-8xl font-black text-white -z-10">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black mb-16 text-center tracking-tight text-white">FAQ</h2>
        <div className="space-y-4">
          <FAQItem
            question="Is it free for community owners?"
            answer="Yes. We partner with tool providers to bring volume discounts. It costs you nothing to offer this to your members."
          />
          <FAQItem
            question="Do members need to buy a full bundle?"
            answer="No. Flexibility is key. Members can choose individual deals for the specific tools they need."
          />
          <FAQItem
            question="Who is this for?"
            answer="Ideal for paid communities (Skool, Circle), bootcamps, courses, and accelerators focused on AI, Coding, No-Code, and SaaS."
          />
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Add $1,200 of Value to Your Community Today</h2>
              <p className="text-gray-400 mb-10 text-lg">Don't let software costs slow down your members. Give them the unfair advantage.</p>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl text-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl mx-auto"
              >
                Apply for Partner Access
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Aporto. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Privacy Policy</a>
            <a href="/data-processing-agreement" className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Data Processing Agreement</a>
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
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-lg text-white">{question}</span>
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