import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Returns a Supabase client that forwards the caller's JWT for RLS enforcement.
 * Requires:
 * - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 * - Authorization: Bearer <access_token> header on the request
 */
export function getSupabaseRLSClient(request: Request): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
  if (!url || !anonKey) {
    const missing = [!url ? "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)" : null, !anonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)" : null]
      .filter(Boolean)
      .join(", ")
    throw new Error(`Missing environment variables: ${missing}`)
  }

  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  if (!token) throw new Error("Missing access token")

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}


