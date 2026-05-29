import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin')) {

        // 1. Check session cookie (set after login)
        const session = request.cookies.get('admin_session')?.value;

        // 2. Basic auth header fallback (optional but adds a second layer)
        const authHeader = request.headers.get('authorization');
        const expectedBasic = `Basic ${Buffer.from(
            `${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`
        ).toString('base64')}`;

        const validSession = session === process.env.ADMIN_SESSION_SECRET;
        const validBasic = authHeader === expectedBasic;

        if (!validSession && !validBasic) {
            // Block API routes with 401
            if (pathname.startsWith('/admin/api') || pathname.startsWith('/api/admin')) {
                return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Redirect page routes to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname); // so you can redirect back after login
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};