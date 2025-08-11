import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

type CheckResult = {
  present: boolean
  ok: boolean
  note?: string
  error?: string
}

type HealthPayload = {
  ok: boolean
  supabase: {
    urlPresent: boolean
    anonPresent: boolean
    serviceRolePresent: boolean
    canQuery: boolean
    error?: string
  }
  neon: CheckResult
  upstashSearch: CheckResult
  resend: CheckResult
}

/**
 * GET /api/integrations/health
 * Returns the presence of env vars and minimal connectivity checks.
 * - Supabase: validates envs and queries tables to confirm DB connectivity
 * - Neon: if configured, connects and runs select 1
 * - Upstash Search: presence check only (no network call here)
 * - Resend: presence check only
 */
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  let canQuery = false
  let supabaseError: string | undefined

  if (supabaseUrl && supabaseServiceRole) {
    try {
      const supabase = getSupabaseAdmin()
      // Perform a light query on the existing tables
      const clientsCheck = await supabase.from("clients").select("id", { head: true, count: "exact" })
      const tasksCheck = await supabase.from("tasks").select("id", { head: true, count: "exact" })
      const ordersCheck = await supabase.from("orders").select("id", { head: true, count: "exact" })
      const anyErr = clientsCheck.error || tasksCheck.error || ordersCheck.error
      canQuery = !anyErr
      if (anyErr) {
        supabaseError = anyErr.message || "Supabase DB query failed"
      }
    } catch (e: any) {
      supabaseError = e?.message || "Supabase admin client failed"
    }
  }

  // Neon (optional)
  const pgUrl =
    process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || ""
  const neon: CheckResult = { present: Boolean(pgUrl), ok: false }
  if (pgUrl) {
    try {
      const { neon: neonClient } = await import("@neondatabase/serverless")
      const sql = neonClient(pgUrl)
      const rows = await sql`select 1 as ok`
      neon.ok = Array.isArray(rows) && rows.length > 0
      neon.note = "Connected to Postgres and ran select 1"
    } catch (e: any) {
      neon.ok = false
      neon.error = e?.message || "Neon connectivity check failed"
    }
  }

  // Upstash Search (presence only)
  const upstashSearchPresent =
    Boolean(process.env.UPSTASH_SEARCH_REST_URL) &&
    Boolean(process.env.UPSTASH_SEARCH_REST_TOKEN || process.env.UPSTASH_SEARCH_REST_READONLY_TOKEN)
  const upstashSearch: CheckResult = {
    present: upstashSearchPresent,
    ok: upstashSearchPresent,
    note: upstashSearchPresent ? "Env present (no network call)" : "Missing env(s)",
  }

  // Resend (presence only)
  const resendPresent = Boolean(process.env.RESEND_API_KEY && process.env.SUPPORT_INBOX_EMAIL)
  const resend: CheckResult = {
    present: resendPresent,
    ok: resendPresent,
    note: resendPresent ? "Env present (no network call)" : "Missing env(s)",
  }

  const payload: HealthPayload = {
    // Overall OK should reflect core functionality (Supabase + optional services present if configured).
    // Neon is optional; if configured but failing, we still report its status but do not fail overall OK.
    ok:
      Boolean(supabaseUrl && supabaseAnon && supabaseServiceRole && canQuery) &&
      upstashSearch.ok &&
      resend.ok,
    supabase: {
      urlPresent: Boolean(supabaseUrl),
      anonPresent: Boolean(supabaseAnon),
      serviceRolePresent: Boolean(supabaseServiceRole),
      canQuery,
      error: supabaseError,
    },
    neon,
    upstashSearch,
    resend,
  }

  return NextResponse.json(payload)
}
