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

async function hasOwnerColumn(): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_schema", "public")
    .eq("table_name", "clients")
    .eq("column_name", "owner_id")
    .maybeSingle()
  return Boolean(data)
}

export async function GET(request: Request) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    const ownerAware = await hasOwnerColumn()
    let query = supabase.from("clients").select("*").order("created_at", { ascending: false })
    if (ownerAware) query = query.eq("owner_id", user.id)
    const { data, error } = await query
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
    const ownerAware = await hasOwnerColumn()
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
      ...(ownerAware ? { owner_id: user.id } : {}),
    }

    const { data, error } = await supabase.from("clients").insert(insertRow).select("*").single()
    if (error) throw error
    return NextResponse.json({ client: toClient(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
