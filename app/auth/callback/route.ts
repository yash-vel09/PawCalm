import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Explicit ?next param overrides (e.g. password reset)
      if (next) return NextResponse.redirect(new URL(next, origin))

      // New users (onboarding_complete not set) go to welcome screen
      const onboardingComplete = data.user?.user_metadata?.onboarding_complete
      return NextResponse.redirect(
        new URL(onboardingComplete ? '/' : '/welcome', origin)
      )
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', origin))
}
