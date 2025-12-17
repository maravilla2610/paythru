import { NextResponse } from 'next/server'
import { createClient } from '@/lib/providers/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'
  const code = searchParams.get('code')

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${next}`)
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=auth-code-error`)
}
