/**
 * Next.js Edge Middleware for Food Bridge.
 * Intercepts requests to refresh Supabase authentication sessions and enforce route protections.
 *
 * @module middleware
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware function executed before request completion.
 * Calls `updateSession` to handle auth token refresh and route guards.
 *
 * @param {NextRequest} request - Incoming HTTP request.
 * @returns {Promise<import('next/server').NextResponse>} Next.js response.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Matcher configuration to filter paths that middleware should run on.
 * Excludes static assets, Next.js internal files, favicon, and public images.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
