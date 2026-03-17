'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { document.title = 'Reset password — PawCalm' }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isConfigured) {
      setSubmitted(true)
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const [start] = [Date.now()]
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    const elapsed = Date.now() - start
    if (elapsed < 500) await new Promise((r) => setTimeout(r, 500 - elapsed))
    setIsLoading(false)
    setSubmitted(true) // always show success — don't leak email existence
  }

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col items-center pt-20 px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2">
          <PawPrint className="w-12 h-12 text-pawcalm-teal" />
          <h1 className="text-2xl font-bold text-calm-navy">PawCalm</h1>
          <p className="text-sm text-medium-gray">Peace of mind in every worried moment</p>
        </div>

        {/* Demo banner */}
        {!isConfigured && (
          <div className="w-full bg-light-teal text-pawcalm-teal text-xs rounded-button px-3 py-2 text-center">
            Running in demo mode — auth not configured.{' '}
            <button onClick={() => router.push('/')} className="underline font-semibold">
              Enter app →
            </button>
          </div>
        )}

        {/* Card */}
        <div className="w-full bg-white rounded-card shadow-sm border border-warm-gray p-6 flex flex-col gap-4">
          {/* Back arrow */}
          <Link href="/login" className="flex items-center gap-1 text-medium-gray hover:text-calm-navy transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to login</span>
          </Link>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <CheckCircle className="w-12 h-12 text-pawcalm-teal" />
              <h2 className="text-lg font-bold text-calm-navy">Check your email</h2>
              <p className="text-sm text-medium-gray">
                We sent a password reset link to{' '}
                <span className="text-calm-navy font-semibold">{email}</span>. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="text-sm text-pawcalm-teal font-semibold">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold text-calm-navy">Reset your password</h2>
                <p className="text-sm text-medium-gray mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="text-sm text-call-vet-red bg-soft-red-bg rounded-button px-3 py-2.5 leading-snug">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-calm-navy">Email address</label>
                  <input
                    type="email"
                    autoFocus
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-2 border-warm-gray rounded-button px-4 py-3 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors min-h-[48px] disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-pawcalm-teal text-white font-semibold text-sm rounded-button min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
