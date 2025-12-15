import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Define main domain (localhost for dev, example.com for prod)
    // In production, you would use an environment variable e.g. process.env.ROOT_DOMAIN
    const ROOT_DOMAIN = 'tanjai.app';

    // 1. Identify Tenant from Subdomain
    // e.g. noodle.tanjai.app -> tenant: noodle
    let currentHost = hostname.replace(`.${ROOT_DOMAIN}`, '');

    // Handle localhost case for testing (e.g. noodle.localhost:3000)
    if (hostname.includes('localhost')) {
        currentHost = hostname.split('.')[0];
        if (currentHost === 'localhost') {
            currentHost = ''; // No subdomain
        }
    }

    // 2. Rewrite logic
    // If there is a subdomain, we rewrite the incoming request to a specific tenant folder
    // e.g. noodle.tanjai.app/menu -> /_tenant/noodle/menu

    if (currentHost) {
        // Determine if this is an API request or Page request
        // For API, we might want to pass a header.

        // Clone the request headers and set the tenant context
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-tenant-slug', currentHost);

        // You can also rewrite the URL to handle multi-tenant routing in the App Router
        // e.g. mapped to src/app/[tenant]/...
        return NextResponse.rewrite(
            new URL(`/${currentHost}${url.pathname}`, request.url),
            {
                request: {
                    headers: requestHeaders,
                },
            }
        );
    }

    // If no subdomain, continue as normal (Landing page)
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
