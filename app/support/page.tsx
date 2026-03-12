"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, HelpCircle, MessageSquare, Phone, SendHorizontal, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { SiteFooter } from "@/components/site-footer"
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
      toast({ title: "Message sent", description: "Thanks. We’ll reply within 24 hours." })
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
      <main className="page-shell">
        <section className="section-wrap py-14 md:py-18">
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="warm-band border-border p-7 md:p-10">
              <div className="space-y-6">
                <div>
                  <div className="section-label">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    CLIENTIVE support
                  </div>
                  <h1 className="mt-5 text-4xl font-semibold md:text-5xl">Need help staying in motion?</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                    We treat support like product design: fast answers, clear paths, and no scavenger hunt for basic
                    help.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["Within 24 hours", "Response target for email support"],
                    ["Auth + product", "Help with sign-in, setup, and workflow questions"],
                    ["Human guidance", "No fake chatbot theater"],
                  ].map(([title, copy]) => (
                    <div key={title} className="surface-panel p-5">
                      <div className="text-sm font-semibold">{title}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                    </div>
                  ))}
                </div>

                <div className="surface-panel p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Faster ways to get unstuck
                  </div>
                  <div className="mt-4 grid gap-3">
                    <Link
                      href="/demo"
                      className="flex items-center justify-between rounded-2xl border border-border bg-[hsl(var(--surface-ivory))] px-4 py-3 text-sm font-medium hover:border-primary/30 hover:bg-accent/25"
                    >
                      Walk through the interactive demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href="mailto:support@avdclientive.com"
                      className="flex items-center justify-between rounded-2xl border border-border bg-[hsl(var(--surface-ivory))] px-4 py-3 text-sm font-medium hover:border-primary/30 hover:bg-accent/25"
                    >
                      Email support@avdclientive.com
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <Link
                      href="/auth/sign-up"
                      className="flex items-center justify-between rounded-2xl border border-border bg-[hsl(var(--surface-ivory))] px-4 py-3 text-sm font-medium hover:border-primary/30 hover:bg-accent/25"
                    >
                      Start with a fresh account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-border bg-card">
              <div className="px-7 py-9 md:px-12 md:py-11">
                <div className="text-center">
                  <h2 className="text-3xl font-semibold text-slate-900">Answers first, contact second</h2>
                  <p className="mt-3 text-slate-600">Find the quick answer or send a detailed note to the team.</p>
                </div>

                <Separator className="my-8 bg-slate-200" />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <HelpCircle className="h-5 w-5 text-slate-700" aria-hidden="true" />
                      <span>{"Quick Help"}</span>
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="q1" className="border-b border-slate-200">
                        <AccordionTrigger className="text-left">{"How do I add a client?"}</AccordionTrigger>
                        <AccordionContent>
                          {
                            "Go to the dashboard, open Clients, and add a record manually or import a CSV when you want a faster starting point."
                          }
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="q2" className="border-b border-slate-200">
                        <AccordionTrigger className="text-left">{"How do I set a follow-up reminder?"}</AccordionTrigger>
                        <AccordionContent>
                          {
                            "Open Tasks, create a follow-up, set the due date, and enable email reminders if that workflow is turned on in your settings."
                          }
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="q3" className="border-b border-slate-200">
                        <AccordionTrigger className="text-left">{"Can I export my client list?"}</AccordionTrigger>
                        <AccordionContent>
                          {"Yes. Export clients anytime, and include orders if order tracking is enabled for your workspace."}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="q4" className="border-b border-slate-200">
                        <AccordionTrigger className="text-left">{"Is there a demo without signing in?"}</AccordionTrigger>
                        <AccordionContent>
                          {"Yes. Use the public demo page to explore the workflow before creating an account."}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="q5" className="border-b border-slate-200">
                        <AccordionTrigger className="text-left">{"How do I contact support?"}</AccordionTrigger>
                        <AccordionContent>
                          {"Use the form on this page or send an email directly. We typically reply within one business day."}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
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
                            rows={6}
                            placeholder="Tell us what you’re trying to do, what blocked you, and any error details."
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <Button type="submit" className="text-white" disabled={isSubmitting}>
                          <SendHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                          {isSubmitting ? "Sending..." : "Send support request"}
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
                      <p className="text-xs text-slate-500">{"Share as much context as you can. It helps us reply faster."}</p>
                    </form>

                    <div className="mt-5">
                      <a
                        href="https://wa.me/15551234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-800 hover:bg-slate-50"
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
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
