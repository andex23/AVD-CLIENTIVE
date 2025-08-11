import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"

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

    const { data, error } = await supabase.from("clients").update(updates).eq("id", params.id).select("*").single()
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
    const { error } = await supabase.from("clients").delete().eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
