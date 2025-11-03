import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const pathname = req.nextUrl.pathname

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // No session = redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // ALWAYS fetch role from profiles_new table (single source of truth)
  const { data: profile, error } = await supabase
    .from('profiles_new')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // If no role found, redirect to login (user may not have a profile)
  if (error || !profile?.role) {
    console.error('No role found for user', session.user.id, error)
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = profile.role

  // Admin route protection
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // User route protection  
  if (pathname.startsWith('/user') && role !== 'user') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/poll',
    '/profile',
    '/attendance',
  ],
}
