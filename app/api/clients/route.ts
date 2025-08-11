import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"
import type { Client } from "@/types/client"

function toClient(row: any): Client {
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

function isOwnerColumnMissing(err: any) {
  const msg = String(err?.message || "")
  return msg.includes("owner_id") && msg.includes("does not exist")
}

export async function GET(request: Request) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    // Try owner scoping first; if column doesn't exist, fall back
    let { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
    if (error && isOwnerColumnMissing(error)) {
      ;({ data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false }))
    }
    if (error) throw error
    return NextResponse.json({ clients: (data || []).map(toClient) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const payload = await request.json()
    if (!payload.name || !payload.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const insertRow = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      company: payload.company || null,
      status: payload.status || "prospect",
      last_contact: payload.lastContact || new Date().toISOString(),
      tags: payload.tags ?? [],
      notes: payload.notes || null,
      interactions: payload.interactions ?? [],
      owner_id: user.id,
    }
    let { data, error } = await supabase.from("clients").insert(insertRow).select("*").single()
    if (error && isOwnerColumnMissing(error)) {
      const retryRow = { ...insertRow }
      delete (retryRow as any).owner_id
      ;({ data, error } = await supabase.from("clients").insert(retryRow).select("*").single())
    }
    if (error) throw error
    return NextResponse.json({ client: toClient(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
