import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates the internal API key from the request headers
 */
export function validateInternalApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-tanjai-api-key');
  const expectedKey = process.env.TANJAI_INTERNAL_API_KEY;

  if (!expectedKey) {
    console.error('[Auth] TANJAI_INTERNAL_API_KEY not configured');
    return false;
  }

  return apiKey === expectedKey;
}

/**
 * Simple In-Memory Rate Limiter (Basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const userData = rateLimitMap.get(identifier) || { count: 0, lastReset: now };

  if (now - userData.lastReset > WINDOW_SIZE) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  rateLimitMap.set(identifier, userData);
  return userData.count > MAX_REQUESTS;
}

/**
 * Guard for API routes
 */
export function apiGuard(req: NextRequest, options: { skipApiKey?: boolean } = {}) {
  // 1. Rate Limiting (by IP or Forwarded header)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 2. API Key Validation
  if (!options.skipApiKey && !validateInternalApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // All good
}
