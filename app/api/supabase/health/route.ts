import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

// Basic health check to verify env vars and DB connectivity
export async function GET() {
  try {
    const url =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "(not set)"
    const hasServiceRole = Boolean(
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY,
    )

    const supabase = getSupabaseAdmin()

    const clientsCheck = await supabase.from("clients").select("id", { count: "exact", head: true })
    const tasksCheck = await supabase.from("tasks").select("id", { count: "exact", head: true })
    const ordersCheck = await supabase.from("orders").select("id", { count: "exact", head: true })

    return NextResponse.json({
      ok: !clientsCheck.error,
      env: {
        SUPABASE_URL_present: url !== "(not set)",
        SERVICE_ROLE_present: hasServiceRole,
        using_url: url,
      },
      db: {
        clients_table_ok: !clientsCheck.error,
        tasks_table_ok: !tasksCheck.error,
        orders_table_ok: !ordersCheck.error,
      },
      note: "If any *_table_ok is false, run scripts/sql/001_create_tables.sql in Supabase.",
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
