```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const response = NextResponse.next();
  
  // 1. Refresh Session (Required for Supabase Auth in Middleware)
  const supabase = createMiddlewareClient({ req: request, res: response });
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Auth Guards
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth');
  const isOnboarding = url.pathname.startsWith('/onboarding');
  
  // If user is not logged in and trying to access protected routes (not login/auth/static)
  if (!session && !isAuthRoute && !url.pathname.includes('.')) {
      // Redirect to Login
      return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user IS logged in, checks if they are trying to access Login page
  if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); // or root
  }

  // 3. Multi-Tenancy Logic (Existing)
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'tanjai.app'; 
  let currentHost = hostname.replace(`.${ ROOT_DOMAIN } `, '');
  
  if (hostname.includes('localhost')) {
    currentHost = hostname.split('.')[0];
    if (currentHost === 'localhost') currentHost = '';
  }

  if (currentHost) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', currentHost);
    
    // Rewrite to tenant path
    return NextResponse.rewrite(
      new URL(`/ ${ currentHost }${ url.pathname } `, request.url),
      {
        request: { headers: requestHeaders },
      }
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```
