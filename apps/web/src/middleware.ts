import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isRateLimited } from './lib/api-auth';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|public).*)',
  ],
};

export default async function middleware(request: NextRequest) {
  // ============================================
  // 1. Supabase Auth (SSR) - Session Refresh
  // ============================================
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // ============================================
  // 2. Logic & Routing
  // ============================================
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';

  // 2.1 Global Rate Limiting
  if (url.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // 2.2 Multi-tenant Routing
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'tanjai.app';
  const customSubdomain = hostname
    .replace(`.${rootDomain}`, '')
    .replace(`.localhost:3000`, '')
    .replace(`.localhost:3002`, '')
    .replace(`.localhost:3003`, '')
    .replace(`.localhost:3006`, '');

  const isRootDomain = hostname === rootDomain ||
    hostname.startsWith('localhost') ||
    hostname.endsWith('.vercel.app');

  // If it's a subdomain (e.g. shop1.tanjai.app) and not an internal Next.js path
  if (!isRootDomain && customSubdomain && customSubdomain !== 'www') {
    // Rewrite to the tenant path
    const rewriteResponse = NextResponse.rewrite(new URL(`/${customSubdomain}${url.pathname}${url.search}`, request.url));

    // CRITICAL: Copy Supabase response cookies (session) to the rewrite response
    // otherwise the session is lost on the rewritten page
    response.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie);
    });

    return rewriteResponse;
  }

  // 2.3 Prevent Manual Path Access (Security)
  // (Optional: can be enforced or left for flexibility)

  return response;
}
