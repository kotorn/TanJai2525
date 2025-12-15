import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Create Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Refresh Session
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Auth Guards
  const url = request.nextUrl
  const isAuthRoute = url.pathname.startsWith('/login')
  const isOnboarding = url.pathname.startsWith('/onboarding')
  
  // Exclude some paths from auth check
  const isPublicPath = 
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') || 
    url.pathname.includes('.') || 
    url.pathname === '/' // Maybe landing page is public?

  if (!user && !isAuthRoute && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 4. Multi-Tenancy Logic
  const hostname = request.headers.get('host') || ''
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'tanjai.app'
  
  let currentHost = hostname.replace(`.${ROOT_DOMAIN}`, '')
  if (hostname.includes('localhost')) {
     const parts = hostname.split('.')
     if (parts[0] !== 'localhost') {
        currentHost = parts[0]
     } else {
        currentHost = ''
     }
  }

  // Rewrite for Subdomains
  if (currentHost && currentHost !== 'www') {
    // If accessing tenant.tanjai.app, rewrite to /tenant/...
    // BUT we need to be careful not to double rewrite or loop.
    // The previous logic was: rewrite to `/${currentHost}${url.pathname}`
    
    // We must pass the tenant slug to headers for easy access
    response.headers.set('x-tenant-slug', currentHost)
    
    return NextResponse.rewrite(
        new URL(`/${currentHost}${url.pathname}`, request.url),
        response
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
