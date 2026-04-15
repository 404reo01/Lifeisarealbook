import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client — Auth & Storage only
// Database queries go through Prisma (src/lib/prisma.ts)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
