import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { DemoWorkspace } from "@/components/demo-workspace"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Demo",
  description: "Browse a sample CLIENTIVE workspace with clients, follow-ups, tasks, and optional orders. No signup required.",
}

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <section className="section-wrap py-14 md:py-18">
          <div className="max-w-3xl">
            <div className="section-label">Interactive demo</div>
            <h1 className="mt-4 text-4xl font-semibold md:text-6xl">See how Clientive handles client work day to day.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Browse a sample workspace with clients, follow-ups, tasks, and optional orders. No signup required.
            </p>
          </div>

          <div className="mt-10">
            <DemoWorkspace />
          </div>

          <div className="mt-8 grid gap-4 border-t border-border pt-6 md:grid-cols-3">
            {[
              "Clients show recent context, stage, and the next action without feeling like a database.",
              "Tasks group the day into overdue, today, and upcoming work so follow-ups stay moving.",
              "Orders stay optional and attached to the same client record instead of taking over the workspace.",
            ].map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                {item}
              </p>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-border pt-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="section-label">Use your own workspace next</div>
              <h2 className="mt-3 text-3xl font-semibold">When the flow feels right, move from sample data to live work.</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Clientive keeps the same structure you see here, with your own clients, follow-ups, and exports.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/support">Talk to support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
