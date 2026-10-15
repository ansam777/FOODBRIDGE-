/**
 * Supabase Middleware Session Helper.
 * Handles token refreshes and route protection at the edge.
 *
 * @module lib/supabase/middleware
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Updates the user session by refreshing expired Auth tokens and synchronizing cookies.
 * Also enforces route protection by redirecting unauthenticated users to `/auth/login`.
 *
 * IMPORTANT:
 * - Avoid calling `supabase.auth.getSession()` inside middleware, as it reads the JWT
 *   from cookies without cryptographic verification. Use `supabase.auth.getUser()` instead.
 * - Any cookie modifications must be applied to both `request.cookies` and `supabaseResponse.cookies`.
 *
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<NextResponse>} The modified NextResponse with updated cookies or a redirect.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Graceful fallback for local development or demo preview before Supabase is connected
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('xyzcompany') ||
    supabaseUrl === 'your-supabase-url'
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token by calling getUser()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Route protection: redirect unauthenticated users to /auth/login for protected pages
    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      request.nextUrl.pathname !== '/'
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // Graceful error handling in middleware
    console.warn('Supabase middleware auth check failed:', err);
  }

  return supabaseResponse;
}
