/**
 * Server-side Supabase client initialization.
 * Configured for React Server Components (RSC), Server Actions, and Route Handlers.
 * Handles reading and writing cookies via `next/headers`.
 *
 * @module lib/supabase/server
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Creates an asynchronous server-side Supabase client.
 *
 * In Next.js 15+, `cookies()` is an async function and must be awaited.
 * The `setAll` cookie handler wraps mutations in a try/catch block because
 * Next.js disallows setting cookies inside Server Components, while allowing it
 * within Server Actions and Route Handlers.
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient<Database>>} Typed Supabase server client.
 *
 * @example
 * ```tsx
 * // In a Server Component or Server Action:
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function getActiveListings() {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase.from('listings').select('*');
 *   return data;
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be safely ignored if middleware is refreshing user sessions.
          }
        },
      },
    }
  );
}
