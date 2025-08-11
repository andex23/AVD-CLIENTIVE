import { createClient } from "@supabase/supabase-js"

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!url || !serviceRoleKey) {
    const missing = [
      !url ? "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)" : null,
    ]
      .filter(Boolean)
      .join(", ")
    throw new Error(`Missing environment variables: ${missing}`)
  }

  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}
