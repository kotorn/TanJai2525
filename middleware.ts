import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Update/refresh Supabase session
    const response = await updateSession(request)

    // 2. Protected Routes Logic
    // For now, we rely on Supabase RLS and server actions checks.
    // If we want to force redirect to login:
    // const user = ... (need to extract from response or fresh get)
    
    // Example: Redirect to login if accessing dashboard without session
    // This requires reading the session from the updated response/cookies.
    // For MVP, we'll let RLS handle data protection and UI handle auth states.
    
    // Return the response created by updateSession
    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
