import { NextResponse } from "next/server"
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
    if ("clientId" in body) updates.client_id = body.clientId
    if ("product" in body) updates.product = body.product
    if ("description" in body) updates.description = body.description ?? null
    if ("amount" in body) updates.amount = body.amount
    if ("date" in body) updates.date = new Date(body.date).toISOString()
    if ("status" in body) updates.status = body.status

    let { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .select("*")
      .single()
    if (error && isOwnerColumnMissing(error)) {
      ;({ data, error } = await supabase.from("orders").update(updates).eq("id", params.id).select("*").single())
    }
    if (error) throw error
    return NextResponse.json({ order: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabaseAdmin()
    let { error } = await supabase.from("orders").delete().eq("id", params.id).eq("owner_id", user.id)
    if (error && isOwnerColumnMissing(error)) {
      ;({ error } = await supabase.from("orders").delete().eq("id", params.id))
    }
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
