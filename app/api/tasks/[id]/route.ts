import { NextResponse } from "next/server"
import { toFriendlyError } from "@/lib/errors"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"

function isOwnerColumnMissing(err: any) {
  const msg = String(err?.message || "")
  return msg.includes("owner_id") && msg.includes("does not exist")
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const updates: any = {}
    if ("title" in body) updates.title = body.title
    if ("description" in body) updates.description = body.description ?? null
    if ("clientId" in body) updates.client_id = body.clientId
    if ("dueDate" in body) updates.due_date = new Date(body.dueDate).toISOString()
    if ("type" in body) updates.type = body.type
    if ("priority" in body) updates.priority = body.priority
    if ("completed" in body) updates.completed = !!body.completed
    if ("emailNotify" in body) updates.email_notify = !!body.emailNotify

    let { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .select("*")
      .single()
    if (error && isOwnerColumnMissing(error)) {
      ;({ data, error } = await supabase.from("tasks").update(updates).eq("id", params.id).select("*").single())
    }
    if (error) throw error
    return NextResponse.json({ task: data })
  } catch (err: any) {
    return NextResponse.json({ error: toFriendlyError(err?.message || "Failed to update task", 500) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    let { error } = await supabase.from("tasks").delete().eq("id", params.id).eq("owner_id", user.id)
    if (error && isOwnerColumnMissing(error)) {
      ;({ error } = await supabase.from("tasks").delete().eq("id", params.id))
    }
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: toFriendlyError(err?.message || "Failed to delete task", 500) }, { status: 500 })
  }
}
