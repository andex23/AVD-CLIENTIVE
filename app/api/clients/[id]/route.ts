import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const updates: any = {}
    if ("name" in body) updates.name = body.name
    if ("email" in body) updates.email = body.email
    if ("phone" in body) updates.phone = body.phone ?? null
    if ("company" in body) updates.company = body.company ?? null
    if ("status" in body) updates.status = body.status
    if ("lastContact" in body) updates.last_contact = body.lastContact
    if ("tags" in body) updates.tags = body.tags ?? []
    if ("notes" in body) updates.notes = body.notes ?? null
    if ("interactions" in body) updates.interactions = body.interactions ?? []

    const ownerAware = await hasOwnerColumn()
    let query = supabase.from("clients").update(updates).eq("id", params.id)
    if (ownerAware) query = query.eq("owner_id", user.id)
    const { data, error } = await query.select("*").single()
    if (error) throw error
    return NextResponse.json({ client: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    const ownerAware = await hasOwnerColumn()
    let query = supabase.from("clients").delete().eq("id", params.id)
    if (ownerAware) query = query.eq("owner_id", user.id)
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
