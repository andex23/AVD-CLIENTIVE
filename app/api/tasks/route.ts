import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"
import type { Task } from "@/types/task"

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

export async function GET(request: Request) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ tasks: (data || []).map(toTask) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const payload = await request.json()
    if (!payload.title || !payload.clientId || !payload.dueDate) {
      return NextResponse.json({ error: "title, clientId, dueDate are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const insertRow = {
      title: payload.title,
      description: payload.description || null,
      client_id: payload.clientId,
      due_date: new Date(payload.dueDate).toISOString(),
      type: payload.type || "follow-up",
      priority: payload.priority || "medium",
      completed: payload.completed ?? false,
      email_notify: !!payload.emailNotify,
    }

    const { data, error } = await supabase.from("tasks").insert(insertRow).select("*").single()
    if (error) throw error
    return NextResponse.json({ task: toTask(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
