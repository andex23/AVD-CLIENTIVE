import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HomeWorkspacePreview } from "@/components/home-workspace-preview"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Run client work without a bloated CRM",
  description: "CLIENTIVE helps solo service businesses keep client notes, follow-ups, and optional orders in one calm workspace.",
}

const operatingPoints = [
  {
    title: "Clients stay visible",
    body: "See who is active, who needs a touch, and what context matters before you reply.",
  },
  {
    title: "Follow-ups stay moving",
    body: "Keep overdue work, today’s queue, and next actions in one place instead of scattered reminders.",
  },
  {
    title: "Orders stay optional",
    body: "Track simple delivery and revenue context only when the business needs it.",
  },
]

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <section className="section-wrap relative py-14 md:py-20 lg:py-24">
          <div className="hero-orb left-[-8rem] top-20 h-56 w-56 bg-primary/30" />
          <div className="hero-orb right-[-4rem] top-10 h-52 w-52 bg-amber-200/60" />

          <div className="grid items-start gap-10 lg:grid-cols-[0.58fr_0.42fr] lg:gap-12 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="relative z-10 max-w-3xl space-y-8 pt-2">
              <span className="section-label">For solo service businesses</span>

              <div className="space-y-5">
                <h1 className="max-w-[12ch] font-semibold leading-[0.95] tracking-[-0.048em] text-foreground text-[3rem] sm:text-[4rem] lg:text-[4.25rem] xl:text-[4.7rem]">
                  Run client work without a bloated CRM.
                </h1>
                <p className="max-w-xl text-[1.02rem] leading-8 text-muted-foreground">
                  Clientive helps solo service businesses keep track of client notes, next actions, and light order
                  tracking without juggling spreadsheets, reminders, and a full CRM.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up">
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 border-t border-border pt-5 md:grid-cols-3">
                {[
                  ["Clear client history", "Notes, stage, and recent touchpoints stay close to the work."],
                  ["Daily follow-up queue", "Overdue and due-today items stay visible without extra setup."],
                  ["Optional order view", "Revenue context is there when needed and quiet when it is not."],
                ].map(([title, copy]) => (
                  <div key={title} className="border-l border-border pl-4">
                    <div className="text-sm font-semibold">{title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <HomeWorkspacePreview className="relative z-10 lg:mt-2" />
          </div>
        </section>

        <section className="section-wrap py-6 md:py-10">
          <div className="grid gap-6 border-t border-border pt-8 md:grid-cols-3 md:gap-8">
            {operatingPoints.map((item) => (
              <div key={item.title} className="space-y-3">
                <h2 className="font-sans text-xl font-semibold text-foreground">{item.title}</h2>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
