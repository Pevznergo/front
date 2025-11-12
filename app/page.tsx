'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true)
    const handleOpenWaitlist = () => setIsWaitlistOpen(true)
    window.addEventListener('openAuthModal', handleOpenAuth)
    window.addEventListener('openWaitlistModal', handleOpenWaitlist)
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuth)
      window.removeEventListener('openWaitlistModal', handleOpenWaitlist)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Navigation />

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="block">
              Lemon Law{' '}
              <a href="#cases" className="underline underline-offset-4 decoration-gray-500 hover:decoration-gray-300">
                Cases
              </a>
            </span>
            <span className="block mt-2">
              Done{' '}
              <a href="#right" className="underline underline-offset-4 decoration-gray-500 hover:decoration-gray-300">
                Right
              </a>
            </span>
            <span className="block mt-1">
              Done{' '}
              <a href="#fast" className="underline underline-offset-4 decoration-gray-500 hover:decoration-gray-300">
                Fast
              </a>
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300">
            From tracking your vehicle’s repair history to collecting receipts, photos, and service records, we handle the entire process end-to-end. We prepare fully ready-to-file Lemon Law cases, maximizing your chances for refund or replacement with expert-backed strategies.
          </p>

          {/* Mobile-only info blocks, styled as iOS-like cards */}
          <div className="mt-8 md:hidden text-left space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 supports-[backdrop-filter]:bg-white/5 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.02),0_4px_12px_-2px_rgba(0,0,0,0.4)] p-4">
              <h3 className="text-base font-semibold text-gray-100">Vehicle Types We Handle</h3>
              <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                <li>New Cars – Any make or model</li>
                <li>Luxury &amp; Import Vehicles – Including high-value cars</li>
                <li>SUVs &amp; Trucks – All brands</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 supports-[backdrop-filter]:bg-white/5 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.02),0_4px_12px_-2px_rgba(0,0,0,0.4)] p-4">
              <p className="text-gray-300 text-sm">
                We customize our process and case strategy to your vehicle’s history, ensuring the strongest possible claim under Lemon Law.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 supports-[backdrop-filter]:bg-white/5 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.02),0_4px_12px_-2px_rgba(0,0,0,0.4)] p-4">
              <p className="text-gray-300 text-sm">
                Most traditional legal processes take months; we streamline it. Once your vehicle profile and documentation are ready, we can file and manage your case in just weeks.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="inline-flex items-center rounded-full bg-white/10 text-white px-6 py-3 text-sm sm:text-base font-medium shadow-sm ring-1 ring-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Join waitlist
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center rounded-full bg-white text-gray-900 px-6 py-3 text-sm sm:text-base font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Register via invite code
            </button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {isWaitlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWaitlistOpen(false)} />
          <WaitlistCard onClose={() => setIsWaitlistOpen(false)} />
        </div>
      )}
    </main>
  )
}

function WaitlistCard({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const valid = /.+@.+\..+/.test(email)
    if (!valid) {
      setError('Enter a valid email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any).error || 'Something went wrong')
      setSuccess(true)
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 supports-[backdrop-filter]:bg-white/5 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_12px_40px_-8px_rgba(0,0,0,0.5)] p-6">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200">
        ×
      </button>
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Join waitlist</h2>
        <p className="text-sm text-gray-300 mt-1">Get notified when we launch</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label htmlFor="wl-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input id="wl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/20" placeholder="you@example.com" />
        </div>
        {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 text-red-300 px-3 py-2 text-sm">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm">Thanks! You're on the list.</div>}
        <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-full bg-white text-gray-900 px-6 py-3 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60">
          {loading ? 'Please wait…' : 'Join waitlist'}
        </button>
      </form>
    </div>
  )
}