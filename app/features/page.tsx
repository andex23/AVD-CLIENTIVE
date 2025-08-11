import { CheckCircle2, CalendarCheck2, Users, ClipboardList, Package, Shield, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export const metadata = {
  title: "Features • Small Business CRM",
  description: "All-in-one CRM for small teams: clients, tasks, orders, and simple settings.",
}

const features = [
  {
    icon: Users,
    title: "Clients",
    desc: "Add, import, edit, and filter your clients. Quick actions and detail views make it fast to work.",
  },
  {
    icon: ClipboardList,
    title: "Tasks & Follow-ups",
    desc: "Create follow-ups, enable email reminders, and keep your pipeline healthy.",
  },
  {
    icon: CalendarCheck2,
    title: "Calendar Sync",
    desc: "Export tasks to .ics, subscribe to your personal ICS feed, or add to Google Calendar in one click.",
  },
  {
    icon: Package,
    title: "Orders & Tracking",
    desc: "Create and manage orders with editable status and export options for your records.",
  },
  {
    icon: Shield,
    title: "Auth & Security",
    desc: "Supabase authentication with password reset and account deletion flow.",
  },
  {
    icon: Sparkles,
    title: "Accessible UI",
    desc: "Collapsible sidebar, keyboard navigation, responsive design, and dark mode.",
  },
]

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-180px)] bg-white dark:bg-neutral-900">
        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Built for small teams
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Everything you need to manage clients, tasks, and orders
            </h1>
            <p className="mt-4 text-muted-foreground">
              A lightweight CRM that helps you focus on conversations and follow-ups. Bring your clients, stay
              organized, and keep momentum across your day.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild>
                <a href="/dashboard">Open Dashboard</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/support">Get Support</a>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <Card key={f.title} className="border-gray-200 dark:border-neutral-800">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="rounded-md bg-neutral-100 p-2 dark:bg-neutral-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{f.desc}</CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </>
  )
}
