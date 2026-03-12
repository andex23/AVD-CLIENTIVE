import { NextResponse } from "next/server"
import { Resend } from "resend"

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body?.name || "").trim()
    const email = String(body?.email || "").trim()
    const message = String(body?.message || "").trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM
    const to = process.env.RESEND_TO || process.env.RESEND_FROM

    if (!apiKey || !from || !to) {
      console.warn("Support route is missing Resend configuration; accepting request without email delivery.")
      return NextResponse.json({ ok: true, mode: "preview" }, { status: 202 })
    }

    const resend = new Resend(apiKey)
    const subject = `CLIENTIVE support request from ${name}`

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #231b17;">
          <h2 style="margin-bottom: 12px;">CLIENTIVE support request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
      `,
    })

    if (error) {
      console.error("Support email failed", error)
      return NextResponse.json({ error: "Could not send message right now. Please email support directly." }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Support route failed", err)
    return NextResponse.json({ error: "Could not process your message." }, { status: 500 })
  }
}
