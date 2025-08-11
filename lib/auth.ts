import { getSupabaseAdmin } from "@/lib/supabase/admin"

export function isServerAuthConfigured() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY),
  )
}

/**
 * Production: Requires a valid Supabase access token.
 * Returns { user, error } where user is null when unauthorized.
 */
export async function requireUser(request: Request) {
  // Expect Authorization: Bearer <token>
  const auth = request.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token) return { user: null, error: "Missing access token" }

  // Validate token using admin to obtain user id, but RLS will be enforced by using the RLS client in routes
  if (!isServerAuthConfigured()) {
    return { user: null, error: "Auth is not configured" }
  }
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return { user: null, error: "Invalid token" }
  return { user: data.user, error: null }
}
