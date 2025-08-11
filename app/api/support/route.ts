import { NextResponse } from "next/server"

// Simple in-memory fixed-window rate limiter (per IP).
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 5
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function getClientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return "unknown"
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function sendEmail({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const inbox = process.env.SUPPORT_INBOX_EMAIL
  if (!apiKey || !inbox) return { sent: false as const, reason: "not_configured" as const }

  const { Resend } = await import("resend")
  const resend = new Resend(apiKey)

  const subject = `Support request from ${name}`
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#0f172a">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e5e7eb">${message}</pre>
    </div>
  `

  try {
    const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev"
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: inbox,
      replyTo: email,
      subject,
      html,
    })
    if (error) {
      console.error("Resend error:", error)
      return { sent: false as const, reason: "send_error" as const }
    }
    return { sent: true as const }
  } catch (err: unknown) {
    console.error("Resend exception:", err)
    return { sent: false as const, reason: "exception" as const }
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  // Rate limit
  const now = Date.now()
  const existing = buckets.get(ip)
  if (!existing || now >= existing.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
  } else {
    if (existing.count >= RATE_LIMIT) {
      const retryAfter = Math.max(0, Math.ceil((existing.resetAt - now) / 1000))
      return new NextResponse(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      })
    }
    existing.count += 1
    buckets.set(ip, existing)
  }

  // Validate payload
  let body: any
  try {
    body = await req.json()
  } catch (_err: unknown) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const name = String(body?.name ?? "").trim()
  const email = String(body?.email ?? "").trim()
  const message = String(body?.message ?? "").trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing name, email, or message" }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 })
  }

  const result = await sendEmail({ name, email, message })
  if (!result.sent) {
    console.log("[Support message]", { name, email, message, emailed: false, reason: result.reason })
  }

  return NextResponse.json({ ok: true })
}
