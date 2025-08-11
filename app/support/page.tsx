"use client"

import * as React from "react"
import { HelpCircle, MessageSquare, Phone, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { SiteHeader } from "@/components/site-header"

export default function SupportPage() {
  const { toast } = useToast()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) {
      toast({
        title: "Missing details",
        description: "Please fill your name, email, and message.",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) {
        let errMsg = "Please try again."
        try {
          const data = await res.json()
          errMsg = data?.error ?? errMsg
        } catch {
          // ignore JSON parse error
        }
        throw new Error(errMsg)
      }
      toast({ title: "Message sent", description: "Thanks! We’ll reply within 24 hours." })
      setName("")
      setEmail("")
      setMessage("")
    } catch (err: any) {
      toast({
        title: "Could not send message",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-5xl px-4">
          <Card className="mt-10 md:mt-14 rounded-2xl md:rounded-3xl border-slate-200 shadow-sm">
            <div className="px-6 md:px-12 py-10 md:py-14 font-mono">
              {/* 1. Page Header */}
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  {"Need Help? We’re Here for You"}
                </h1>
                <p className="mt-3 text-slate-600">{"Find answers to common questions or contact our support team."}</p>
              </div>

              <Separator className="my-8 bg-slate-200" />

              {/* 2. Quick Help / FAQs + Contact Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quick Help / FAQs */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-slate-700" aria-hidden="true" />
                    <span>{"Quick Help"}</span>
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="q1" className="border-b border-slate-200">
                      <AccordionTrigger className="text-left">{"How do I add a client?"}</AccordionTrigger>
                      <AccordionContent>
                        {
                          "Go to Dashboard → Clients → “Add Client”. Fill in the details and save. You can also import a CSV."
                        }
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q2" className="border-b border-slate-200">
                      <AccordionTrigger className="text-left">{"How do I set a follow-up reminder?"}</AccordionTrigger>
                      <AccordionContent>
                        {
                          "Dashboard → Tasks → “Add Task”. Choose a due date and enable “Email reminder” if you want an email."
                        }
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q3" className="border-b border-slate-200">
                      <AccordionTrigger className="text-left">{"Can I export my client list?"}</AccordionTrigger>
                      <AccordionContent>
                        {
                          "Yes. Dashboard → Clients → Export. You can export clients (and orders if enabled) as CSV or ICS."
                        }
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q4" className="border-b border-slate-200">
                      <AccordionTrigger className="text-left">{"How do I enable dark mode?"}</AccordionTrigger>
                      <AccordionContent>
                        {
                          "Go to Dashboard → Settings → Preferences → Theme. Toggle Light/Dark. It applies instantly and persists."
                        }
                      </AccordionContent>
                    </AccordionItem>
                    {/* Optional 5th FAQ */}
                    <AccordionItem value="q5" className="border-b border-slate-200">
                      <AccordionTrigger className="text-left">{"How do I contact support?"}</AccordionTrigger>
                      <AccordionContent>
                        {"Use the form on this page to send us a message. We typically respond within 24 hours."}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Contact Support */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-700" aria-hidden="true" />
                    <span>{"Contact Support"}</span>
                  </h2>
                  <form onSubmit={onSubmit} className="space-y-4" aria-label="Contact Support Form">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-slate-800">
                          {"Name"}
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="text-slate-800">
                          {"Email"}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="message" className="text-slate-800">
                          {"Message"}
                        </Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={5}
                          placeholder="How can we help?"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Button
                        type="submit"
                        className="bg-[#F35A1F] hover:bg-[#dd4f1c] text-white"
                        disabled={isSubmitting}
                      >
                        <SendHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
                        {isSubmitting ? "Sending..." : "Submit"}
                      </Button>
                      <span className="text-sm text-slate-500">
                        {"Or email us at "}
                        <a
                          href="mailto:support@avdclientive.com"
                          className="underline decoration-slate-300 hover:text-slate-700"
                        >
                          {"support@avdclientive.com"}
                        </a>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{"We usually reply within 24 hours."}</p>
                  </form>

                  {/* Optional: WhatsApp quick link */}
                  <div className="mt-4">
                    <a
                      href="https://wa.me/15551234567"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                      aria-label="Chat with us on WhatsApp"
                    >
                      <Phone className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                      {"Chat with us on WhatsApp"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="py-12" />
        </section>
      </main>
    </>
  )
}
