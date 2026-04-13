import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client — Auth & Storage only
// Database queries go through Prisma (src/lib/prisma.ts)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
