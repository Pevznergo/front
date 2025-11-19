'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import AudioDemo from '@/components/AudioDemo'
import { Check, ChevronDown, ChevronUp, Shield, Users, TrendingUp, Zap, ArrowRight } from 'lucide-react'

export default function Home() {
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
            <span className="text-xs font-medium text-gray-300">Now accepting early access</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Don’t Let Cancellation <br className="hidden sm:block" />
            <span className="ios-gradient-text">Be The End.</span>
          </h1>

          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Turn Your Churned Users Into Revenue via AI-Powered Bundles. We reactivate your lost B2B customers by calling them with irresistible, cross-brand offers they actually want. Zero integration fees. You only pay when we win them back.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Get Your Free Churn Audit
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required • GDPR/CCPA Compliant</p>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-sm text-gray-500 mb-6">Trusted by growth teams at</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Acme Corp', 'GlobalTech', 'Nebula', 'Vertex'].map((name) => (
                <div key={name} className="text-xl font-bold text-white">{name}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why do your customers actually leave?</h2>
            <p className="text-xl text-gray-400">Usually, it’s Price or "Budget Cuts."</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="text-4xl font-bold text-red-500 mb-2">2%</div>
                <div className="text-gray-400">Open rate on your automated "win-back" emails.</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl">
                <div className="text-4xl font-bold text-orange-500 mb-2">$0</div>
                <div className="text-gray-400">Revenue recovered by busy sales teams chasing old leads.</div>
              </div>
            </div>
            <div className="text-lg text-gray-300 leading-relaxed">
              <p>
                Meanwhile, thousands of dollars in ARR walk out the door every month, likely moving to a cheaper competitor or a bundled solution.
              </p>
              <p className="mt-4">
                Your current process isn't working because it doesn't address the core objection: <span className="text-white font-semibold">Value for Money</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION (How We Fix It) */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">We created the <br /><span className="ios-gradient-blue">"Impossible to Refuse"</span> Offer Engine.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Smart Segmentation",
                desc: "We securely ingest your list of cancelled subscriptions via API or CSV. We filter for high-value accounts that left due to pricing or budget constraints.",
                icon: <Users className="w-6 h-6 text-blue-400" />
              },
              {
                step: "02",
                title: "The Strategic Bundle",
                desc: "We pair your product with complementary top-tier SaaS tools to create an exclusive 'Growth Stack' bundle at 40% off. Double the value, illogical to say no.",
                icon: <TrendingUp className="w-6 h-6 text-purple-400" />
              },
              {
                step: "03",
                title: "AI Voice Agent Outreach",
                desc: "Our human-sounding AI agents call your former users. They listen, empathize, and present the exclusive bundle. It feels like a VIP service call.",
                icon: <Zap className="w-6 h-6 text-yellow-400" />
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

      {/* VALUE PROPOSITION */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Why SaaS Founders Choose RetainAI</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Brand-Safe & Compliant",
                desc: "We operate as your authorized Data Processor under strict NDA and GDPR guidelines.",
                icon: <Shield className="w-6 h-6 text-green-400" />
              },
              {
                title: "Automated Partnerships",
                desc: "You don't need to find bundling partners. We have a network ready to cross-sell.",
                icon: <Users className="w-6 h-6 text-blue-400" />
              },
              {
                title: "Pure Performance Model",
                desc: "No retainer. We take a commission from the recovered revenue. No win, no fee.",
                icon: <TrendingUp className="w-6 h-6 text-purple-400" />
              },
              {
                title: "Plug & Play",
                desc: "Start your first reactivation campaign in under 48 hours.",
                icon: <Zap className="w-6 h-6 text-yellow-400" />
              }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl hover:border-white/20 transition-colors">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem
              question="Do I have to share my customer data with other companies?"
              answer="No. We use 'Blind Bundling' technology. Your data stays in a secure silo. We match offers without exposing your user list to the partner company until the user explicitly accepts the offer."
            />
            <FAQItem
              question="What if a customer is angry?"
              answer="Our AI analyzes sentiment in real-time. If a customer is hostile, the AI apologizes and ends the call immediately, marking them as 'Do Not Contact.' We protect your reputation first."
            />
            <FAQItem
              question="How do I get paid?"
              answer="We handle the billing for the bundled offer as a Merchant of Record, or integrate with your Stripe. You receive your share of the renewed subscription monthly."
            />
          </div>
        </div>
      </section>

      {/* FOOTER / CTA */}
      <section id="calculator" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Stop leaving money on the table.</h2>
          <p className="text-xl text-gray-400 mb-12">Let’s calculate how much ARR we can recover for you in Q4.</p>

          <div className="glass-panel p-8 rounded-3xl max-w-xl mx-auto">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Monthly Churn Rate %</label>
                <input type="number" placeholder="e.g. 5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Average Revenue Per User ($)</label>
                <input type="number" placeholder="e.g. 100" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group">
                Calculate My Lost Revenue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>
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