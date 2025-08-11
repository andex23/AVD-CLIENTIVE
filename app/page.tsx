import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, CalendarClock, Database } from "lucide-react"

export const metadata = {
  title: "CLIENTIVE — Simple CRM for Small Business",
  description: "Manage clients, follow-ups, and orders with a lightweight, responsive CRM.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between font-mono">
          <Link href="/" className="flex items-center gap-2">
            <img src="/brand/logo-mark.png" alt="AVD Clientive logo" className="h-8 w-8" />
            <span className="font-semibold text-xl text-slate-900">CLIENTIVE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-slate-700">
            <Link href="/features" className="hover:text-slate-900">
              Features
            </Link>
            <Link href="/support" className="hover:text-slate-900">
              Support
            </Link>
            <Link href="/auth/sign-in" className="inline-flex">
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-orange-50/60 to-white dark:from-orange-900/10 dark:to-neutral-950">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 font-mono">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              Manage Clients, Tasks, and Orders in One Place
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300 font-mono">
              A lightweight CRM to keep your relationships warm and your follow-ups on time. Fully responsive and easy
              to use.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button variant="outline" className="h-11 rounded-xl bg-transparent" asChild>
                <Link href="/dashboard?preview=1">Try the demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Summary */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16 font-mono">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-neutral-900 dark:text-white">
              <Users className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Client Management</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Simple Client Management</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              Add, edit, and search clients. Keep all notes and details together.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-neutral-900 dark:text-white">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Smart Follow-Ups</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Smart Follow-Ups</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              Create tasks, enable email reminders, and sync to your calendar.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-neutral-900 dark:text-white">
              <Database className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Own Your Data</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Own Your Data</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              Import and export anytime. Your data stays yours.
            </p>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white" asChild>
            <Link href="/features">Explore all features</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
