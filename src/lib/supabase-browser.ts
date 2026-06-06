import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookieOptions: {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            name: 'solarth-auth-token'
        }
    }
);