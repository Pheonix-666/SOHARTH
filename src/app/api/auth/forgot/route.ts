'use server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
  }
  const { error } = await supabaseServer.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset?email=${encodeURIComponent(email)}`,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  return new Response(JSON.stringify({ success: true }));
}
