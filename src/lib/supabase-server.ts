import { createClient } from '@supabase/supabase-js';

// Server-side client using the service role key — bypasses RLS.
// ONLY use this in API routes (server-side), never in client components.
export const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
