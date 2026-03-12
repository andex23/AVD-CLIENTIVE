import { NextResponse } from "next/server"
import { toFriendlyError } from "@/lib/errors"
import { getSupabaseRLSClient } from "@/lib/supabase/rls-server"
import { requireUser } from "@/lib/auth"
import type { Task } from "@/types/task"

type RouteContext = { params: Promise<{ id: string }> }

function toTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    clientId: row.client_id,
    dueDate: row.due_date,
    type: row.type,
    priority: row.priority,
    completed: row.completed,
    emailNotify: !!row.email_notify,
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseRLSClient(request)
    const body = await request.json()
    const { id } = await params

    const updates: any = {}
    if ("title" in body) updates.title = body.title
    if ("description" in body) updates.description = body.description ?? null
    if ("clientId" in body) updates.client_id = body.clientId
    if ("dueDate" in body) updates.due_date = new Date(body.dueDate).toISOString()
    if ("type" in body) updates.type = body.type
    if ("priority" in body) updates.priority = body.priority
    if ("completed" in body) updates.completed = body.completed
    if ("emailNotify" in body) updates.email_notify = !!body.emailNotify

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ task: toTask(data) })
  } catch (err: any) {
    return NextResponse.json({ error: toFriendlyError(err?.message || "Failed to update task", 500) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseRLSClient(request)
    const { id } = await params
    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("owner_id", user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: toFriendlyError(err?.message || "Failed to delete task", 500) }, { status: 500 })
  }
}
