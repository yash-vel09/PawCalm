'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co') ?? false

function mapError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return 'The email or password you entered is incorrect. Please try again.'
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email before logging in. Check your inbox.'
  }
  if (m.includes('network') || m.includes('fetch')) {
    return "We're having trouble connecting. Please check your internet and try again."
  }
  return 'Something went wrong. Please try again.'
}

async function minDelay<T>(promise: Promise<T>, ms = 500): Promise<T> {
  const [result] = await Promise.all([promise, new Promise((r) => setTimeout(r, ms))])
  return result as T
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'Log in — PawCalm' }, [])

  // Show error if callback redirected here with ?error=auth
  useEffect(() => {
    if (searchParams.get('error') === 'auth') {
      setError('The confirmation link has expired or is invalid. Please try again.')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isConfigured) {
      router.push('/')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    try {
      const { data, error: authError } = await minDelay(
        supabase.auth.signInWithPassword({ email, password })
      )
      if (authError) {
        setError(mapError(authError.message))
        return
      }
      const onboardingComplete = data.user?.user_metadata?.onboarding_complete
      router.refresh()
      router.push(onboardingComplete ? '/' : '/welcome')
    } catch {
      setError("We're having trouble connecting. Please check your internet and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogle() {
    if (!isConfigured) { router.push('/'); return }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-soft-cream flex flex-col items-center pt-20 px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6">

        {/* Brand */}
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
          <h2 className="text-lg font-bold text-calm-navy">Welcome back</h2>

          {error && (
            <div className="text-sm text-call-vet-red bg-soft-red-bg rounded-button px-3 py-2.5 leading-snug">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-calm-navy">Email address</label>
              <input
                type="email"
                autoFocus
                required
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full border-2 rounded-button px-4 py-3 text-sm text-calm-navy placeholder-medium-gray focus:outline-none transition-colors min-h-[48px] disabled:opacity-60 ${error ? 'border-call-vet-red' : 'border-warm-gray focus:border-pawcalm-teal'}`}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-calm-navy">Password</label>
                <Link href="/forgot-password" className="text-xs text-pawcalm-teal">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full border-2 rounded-button px-4 py-3 pr-11 text-sm text-calm-navy placeholder-medium-gray focus:outline-none transition-colors min-h-[48px] disabled:opacity-60 ${error ? 'border-call-vet-red' : 'border-warm-gray focus:border-pawcalm-teal'}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-pawcalm-teal"
              />
              <span className="text-sm text-calm-navy">Remember me on this device</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pawcalm-teal text-white font-semibold text-sm rounded-button min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-warm-gray" />
            <span className="text-xs text-medium-gray">or continue with</span>
            <div className="flex-1 h-px bg-warm-gray" />
          </div>

          {/* Google */}
          {isConfigured && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full bg-white border border-warm-gray rounded-button min-h-[48px] flex items-center justify-center gap-3 text-sm font-semibold text-calm-navy hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-sm text-medium-gray">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-pawcalm-teal font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
