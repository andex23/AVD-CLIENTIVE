import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"
import { buildICSCalendar } from "@/lib/calendar"

function toClient(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    status: row.status,
    lastContact: row.last_contact,
    tags: Array.isArray(row.tags) ? row.tags : row.tags || [],
    notes: row.notes ?? undefined,
    interactions: row.interactions || [],
  }
}

function toTask(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    clientId: row.client_id,
    dueDate: row.due_date,
    type: row.type,
    priority: row.priority,
    completed: row.completed,
  }
}

export async function GET(request: Request) {
  // Auth: require user (allows preview/dev via requireUser)
  const { user } = await requireUser(request)
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const [tasksRes, clientsRes] = await Promise.all([
      supabase.from("tasks").select("*"),
      supabase.from("clients").select("*"),
    ])

    if (tasksRes.error) throw tasksRes.error
    if (clientsRes.error) throw clientsRes.error

    const tasks = (tasksRes.data || []).map(toTask)
    const clients = (clientsRes.data || []).map(toClient)
    const ics = buildICSCalendar(tasks, clients)

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    return new NextResponse(
      `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AVD Clientive//CRM Tasks//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:error@clientive.local
DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d+Z$/, "Z")}
SUMMARY:Calendar feed error
DESCRIPTION:${(err?.message || "Unknown error").replace(/\r?\n/g, "\\n")}
DTSTART:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d+Z$/, "Z")}
DTEND:${new Date(Date.now() + 30 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d+Z$/, "Z")}
END:VEVENT
END:VCALENDAR`,
      {
        status: 200,
        headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" },
      },
    )
  }
}
