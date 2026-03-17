'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

function mapError(error: { message: string }): string {
  const msg = error.message.toLowerCase()
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return 'An account with this email already exists.'
  }
  return 'Something went wrong. Please try again.'
}

function getStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const score = getStrength(password)
  const pct = (score / 5) * 100

  let color = 'bg-red-500'
  let label = 'Weak'
  if (pct >= 70) { color = 'bg-green-500'; label = 'Strong' }
  else if (pct >= 40) { color = 'bg-amber-400'; label = 'Fair' }

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="w-full h-1.5 bg-warm-gray rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-medium-gray">At least 8 characters</span>
        <span className={`text-xs font-semibold ${color.replace('bg-', 'text-')}`}>{label}</span>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isConfigured) {
      router.push('/')
      return
    }

    setIsLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setIsLoading(false)

    if (authError) {
      setError(mapError(authError))
    } else {
      setEmailSent(true)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-soft-cream flex flex-col items-center pt-20 px-6">
        <div className="w-full max-w-[400px] flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <PawPrint className="w-12 h-12 text-pawcalm-teal" />
            <h1 className="text-2xl font-bold text-calm-navy">PawCalm</h1>
          </div>
          <div className="w-full bg-white rounded-card shadow-sm border border-warm-gray p-6 flex flex-col items-center gap-4 text-center">
            <Mail className="w-12 h-12 text-pawcalm-teal" />
            <h2 className="text-lg font-bold text-calm-navy">Check your email!</h2>
            <p className="text-sm text-medium-gray">
              We sent a confirmation link to <span className="text-calm-navy font-semibold">{email}</span>. Check your inbox and spam folder.
            </p>
            <Link href="/login" className="text-sm text-pawcalm-teal font-semibold">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
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
          <h2 className="text-lg font-bold text-calm-navy">Create your account</h2>

          {error && (
            <div className="text-xs text-call-vet-red bg-red-50 rounded-button px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-calm-navy">Your name</label>
              <input
                type="text"
                autoFocus
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="How should we greet you?"
                className="w-full border-2 border-warm-gray rounded-button px-4 py-3 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors min-h-[48px]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-calm-navy">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-warm-gray rounded-button px-4 py-3 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors min-h-[48px]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-calm-navy">Create a password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full border-2 border-warm-gray rounded-button px-4 py-3 pr-11 text-sm text-calm-navy placeholder-medium-gray focus:outline-none focus:border-pawcalm-teal transition-colors min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pawcalm-teal text-white font-semibold text-sm rounded-button min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
            </button>

            {/* Legal */}
            <p className="text-xs text-medium-gray text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-pawcalm-teal">Terms of Service</a> and{' '}
              <a href="#" className="text-pawcalm-teal">Privacy Policy</a>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-sm text-medium-gray">
          Already have an account?{' '}
          <Link href="/login" className="text-pawcalm-teal font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
