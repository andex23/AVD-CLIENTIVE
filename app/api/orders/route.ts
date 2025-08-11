import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"
import type { Order } from "@/types/order"

function toOrder(row: any): Order {
  return {
    id: row.id,
    clientId: row.client_id,
    product: row.product,
    description: row.description ?? undefined,
    amount: Number(row.amount),
    date: row.date,
    status: row.status,
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
    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("owner_id", user.id)
      .order("date", { ascending: false })
    if (error && isOwnerColumnMissing(error)) {
      ;({ data, error } = await supabase.from("orders").select("*").order("date", { ascending: false }))
    }
    if (error) throw error
    return NextResponse.json({ orders: (data || []).map(toOrder) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user } = await requireUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const payload = await request.json()
    if (!payload.product || !payload.clientId || payload.amount == null || !payload.date) {
      return NextResponse.json({ error: "product, clientId, amount, date are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const insertRow = {
      client_id: payload.clientId,
      product: payload.product,
      description: payload.description || null,
      amount: payload.amount,
      date: new Date(payload.date).toISOString(),
      status: payload.status || "pending",
      owner_id: user.id,
    }
    let { data, error } = await supabase.from("orders").insert(insertRow).select("*").single()
    if (error && isOwnerColumnMissing(error)) {
      const retryRow = { ...insertRow }
      delete (retryRow as any).owner_id
      ;({ data, error } = await supabase.from("orders").insert(retryRow).select("*").single())
    }
    if (error) throw error
    return NextResponse.json({ order: toOrder(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
