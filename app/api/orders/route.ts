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

async function hasOwnerColumn(): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_schema", "public")
    .eq("table_name", "orders")
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
    let query = supabase.from("orders").select("*").order("date", { ascending: false })
    if (ownerAware) query = query.eq("owner_id", user.id)
    const { data, error } = await query
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
    const ownerAware = await hasOwnerColumn()
    const insertRow = {
      client_id: payload.clientId,
      product: payload.product,
      description: payload.description || null,
      amount: payload.amount,
      date: new Date(payload.date).toISOString(),
      status: payload.status || "pending",
      ...(ownerAware ? { owner_id: user.id } : {}),
    }

    const { data, error } = await supabase.from("orders").insert(insertRow).select("*").single()
    if (error) throw error
    return NextResponse.json({ order: toOrder(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
