import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"

function isAdmin(user: { id: string; email?: string | null }) {
  const ids = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean)
  const emails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (ids.length && ids.includes(user.id)) return true
  if (emails.length && user.email && emails.includes(user.email.toLowerCase())) return true
  return false
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(request)
  if (!user || error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!isAdmin({ id: user.id, email: (user as any).email })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { action } = await request.json()
    if (!action || !["backfill_unowned", "purge_unowned"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    if (action === "backfill_unowned") {
      const updates = { owner_id: user.id }
      const clients = await supabase.from("clients").update(updates).is("owner_id", null).select("id")
      const tasks = await supabase.from("tasks").update(updates).is("owner_id", null).select("id")
      const orders = await supabase.from("orders").update(updates).is("owner_id", null).select("id")
      const anyErr = clients.error || tasks.error || orders.error
      if (anyErr) throw anyErr
      return NextResponse.json({
        ok: true,
        action,
        counts: {
          clients: clients.data?.length || 0,
          tasks: tasks.data?.length || 0,
          orders: orders.data?.length || 0,
        },
      })
    }

    if (action === "purge_unowned") {
      const tasks = await supabase.from("tasks").delete().is("owner_id", null).select("id")
      const orders = await supabase.from("orders").delete().is("owner_id", null).select("id")
      const clients = await supabase.from("clients").delete().is("owner_id", null).select("id")
      const anyErr = clients.error || tasks.error || orders.error
      if (anyErr) throw anyErr
      return NextResponse.json({
        ok: true,
        action,
        counts: {
          clients: clients.data?.length || 0,
          tasks: tasks.data?.length || 0,
          orders: orders.data?.length || 0,
        },
      })
    }

    return NextResponse.json({ error: "Unhandled" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}


