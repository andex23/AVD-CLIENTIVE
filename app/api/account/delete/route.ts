import { NextResponse } from "next/server"
import { isServerAuthConfigured } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  // Demo/preview: no-op
  if (!isServerAuthConfigured()) {
    return new NextResponse(null, { status: 204 })
  }

  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { error: delError } = await supabase.auth.admin.deleteUser(data.user.id as string)
    if (delError) {
      console.error("Delete user failed", delError)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    console.error("Delete user exception", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
