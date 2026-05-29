import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { password } = await req.json();

    if (password !== process.env.ADMIN_PASS) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set('admin_session', process.env.ADMIN_SESSION_SECRET!, {
        httpOnly: true,      // JS cannot read this cookie
        secure: true,        // HTTPS only in production
        sameSite: 'strict',  // No cross-site requests
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
    });

    return res;
}

