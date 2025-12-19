import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from './lib/api-auth';

export default function middleware(request: NextRequest) {
  // Global Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'], // Only apply to API routes for web app
};
