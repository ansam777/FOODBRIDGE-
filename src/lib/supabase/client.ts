/**
 * Browser-side Supabase client initialization.
 * Utilizes `@supabase/ssr` to create a singleton client instance in the browser.
 *
 * @module lib/supabase/client
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates and returns a Supabase client configured for browser environments.
 * Manages authentication state in browser cookies so it stays in sync with the server.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient<Database>} Typed Supabase browser client.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 * import { useEffect, useState } from 'react';
 *
 * export function ListingsFeed() {
 *   const supabase = createClient();
 *   // Use supabase client in client components or hooks
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
