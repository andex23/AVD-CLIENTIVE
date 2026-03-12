"use client"

import type React from "react"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react"
import { BrandLockup } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const authProof = [
  {
    icon: Workflow,
    title: "Client rhythm, not client chaos",
    body: "Bring clients, follow-ups, and orders into one calm daily workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Supabase auth, account recovery, and clean access flows without product clutter.",
  },
  {
    icon: Sparkles,
    title: "Made for solo operators",
    body: "Designed for service owners who need momentum, not enterprise overhead.",
  },
]

export function AuthShell({
  title,
  eyebrow,
  copy,
  children,
  footer,
}: {
  title: string
  eyebrow: string
  copy: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="page-shell min-h-screen">
      <div className="hero-orb left-[-6rem] top-16 h-48 w-48 bg-primary/30" />
      <div className="hero-orb right-[-4rem] top-24 h-56 w-56 bg-amber-200/50" />

      <div className="section-wrap relative py-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLockup />
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/demo">See live demo</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="section-wrap relative grid gap-10 pb-10 pt-6 lg:grid-cols-[1.22fr_0.98fr] lg:items-center lg:pb-16 lg:pt-10">
        <section className="space-y-8">
          <div className="max-w-2xl space-y-5">
            <span className="section-label">{eyebrow}</span>
            <div className="space-y-4">
              <h1 className="display-hero max-w-2xl">{title}</h1>
              <p className="lead-copy max-w-2xl">{copy}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:max-w-3xl">
            {authProof.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="surface-panel border-border bg-[hsl(var(--surface-ivory))]">
                  <div className="p-5">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <div className="lg:justify-self-end">
          <Card className="surface-card w-full max-w-xl overflow-hidden border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    CLIENTIVE access
                  </div>
                  <div className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-foreground">
                    Operating system for client work
                  </div>
                </div>
                <div className="glass-line rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                  Light-first
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">{children}</div>
            {footer ? <div className="border-t border-border/70 px-6 py-5 md:px-8">{footer}</div> : null}
          </Card>
        </div>
      </main>
    </div>
  )
}
