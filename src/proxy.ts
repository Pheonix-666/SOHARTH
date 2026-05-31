import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin')) {
        const session = request.cookies.get('admin_session')?.value;
        const secret = process.env.ADMIN_SESSION_SECRET;

        if (!secret) {
            return new NextResponse('Server misconfigured', { status: 500 });
        }

        if (!session || session !== secret) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};