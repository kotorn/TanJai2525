import { NextRequest, NextResponse } from 'next/server';
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

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';

  // 1. Global Rate Limiting (API only or all?)
  if (url.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // 2. Multi-tenant Routing (Subdomain Mapping)
  // Logic: [tenant].tanjai.app/* -> tanjai.app/[tenant]/*
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
    // e.g. shop1.tanjai.app/menu -> tanjai.app/shop1/menu
    return NextResponse.rewrite(new URL(`/${customSubdomain}${url.pathname}${url.search}`, request.url));
  }

  // 3. Prevent Manual Path Access (Security)
  // If user tries to access /shop1 manually on the main domain when they should use subdomain
  // (Optional: can be enforced or left for flexibility)

  return NextResponse.next();
}
