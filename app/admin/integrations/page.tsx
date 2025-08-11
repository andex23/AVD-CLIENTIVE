"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, RefreshCw, Unplug, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { IntegrationBadge } from "@/components/integration-badge"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type CheckResult = { present: boolean; ok: boolean; note?: string; error?: string }
type HealthPayload = {
  ok: boolean
  supabase: {
    urlPresent: boolean
    anonPresent: boolean
    serviceRolePresent: boolean
    canQuery: boolean
    error?: string
  }
  neon: CheckResult
  upstashSearch: CheckResult
  resend: CheckResult
}

function Row({
  name,
  present,
  ok,
  note,
  error,
  missingEnv,
}: {
  name: string
  present: boolean
  ok: boolean
  note?: string
  error?: string
  missingEnv?: string[]
}) {
  const { toast } = useToast()
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Copied", description: text })
    } catch {
      toast({ title: "Copy failed", description: text, variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IntegrationBadge ok={ok} label={name} />
          {!present && <span className="text-xs text-muted-foreground">(not configured)</span>}
        </div>
        {missingEnv && missingEnv.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {missingEnv.map((env) => (
              <Button key={env} variant="outline" size="sm" onClick={() => copy(env)} aria-label={`Copy ${env}`}>
                Copy {env}
              </Button>
            ))}
          </div>
        )}
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default function IntegrationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState<HealthPayload | null>(null)

  const fetchStatus = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/integrations/health", { cache: "no-store" })
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as HealthPayload
      setStatus(json)
    } catch (e: any) {
      toast({ title: "Status check failed", description: e?.message || "Try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const refreshSupabaseSession = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      toast({
        title: "Session refreshed",
        description: data?.session ? "Active session refreshed." : "No active session.",
      })
    } catch (e: any) {
      toast({ title: "Refresh failed", description: e?.message || "Try signing in again.", variant: "destructive" })
    }
  }

  const signOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.replace("/auth/sign-in")
    } catch {
      router.replace("/auth/sign-in")
    }
  }

  const supabaseMissing: string[] = []
  if (status) {
    if (!status.supabase.urlPresent) supabaseMissing.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
    if (!status.supabase.anonPresent) supabaseMissing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!status.supabase.serviceRolePresent) supabaseMissing.push("SUPABASE_SERVICE_ROLE or SUPABASE_SERVICE_ROLE_KEY")
  }

  const neonMissing: string[] = []
  const pgPresent =
    Boolean(process.env.POSTGRES_PRISMA_URL) ||
    Boolean(process.env.POSTGRES_URL_NON_POOLING) ||
    Boolean(process.env.POSTGRES_URL)
  if (!pgPresent) {
    neonMissing.push("POSTGRES_PRISMA_URL or POSTGRES_URL or POSTGRES_URL_NON_POOLING")
  }

  const upstashMissing: string[] = []
  const upstashPresent =
    Boolean(process.env.UPSTASH_SEARCH_REST_URL) &&
    Boolean(process.env.UPSTASH_SEARCH_REST_TOKEN || process.env.UPSTASH_SEARCH_REST_READONLY_TOKEN)
  if (!upstashPresent) {
    upstashMissing.push("UPSTASH_SEARCH_REST_URL")
    upstashMissing.push("UPSTASH_SEARCH_REST_TOKEN or UPSTASH_SEARCH_REST_READONLY_TOKEN")
  }

  const resendMissing: string[] = []
  const resendPresent = Boolean(process.env.RESEND_API_KEY && process.env.SUPPORT_INBOX_EMAIL)
  if (!resendPresent) {
    resendMissing.push("RESEND_API_KEY")
    resendMissing.push("SUPPORT_INBOX_EMAIL")
  }

  return (
    <SidebarProvider>
      <AppSidebar
        active="settings"
        onNavigate={(key) => {
          if (key === "settings") router.push("/dashboard/settings")
          else if (key === "overview") router.push("/dashboard#overview")
          else router.push(`/dashboard?tab=${encodeURIComponent(key)}`)
        }}
      />
      <SidebarInset>
        <div className="border-b bg-slate-900 text-white">
          <div className="flex h-16 items-center px-4">
            <SidebarTrigger className="-ml-1 mr-2" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              <h1 className="text-lg font-semibold">Integrations Health</h1>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={fetchStatus} disabled={loading} aria-label="Run checks">
                <RefreshCw className="h-4 w-4 mr-2" />
                {loading ? "Checking..." : "Run checks"}
              </Button>
              <Button variant="outline" onClick={refreshSupabaseSession} aria-label="Refresh Supabase session">
                <Unplug className="h-4 w-4 mr-2" />
                Refresh Session
              </Button>
              <Button variant="ghost" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <main className="p-4 md:p-6">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <IntegrationBadge
                  ok={Boolean(status?.ok)}
                  label={status?.ok ? "All checks passed" : "Attention needed"}
                />
                <p className="text-sm text-muted-foreground">
                  This page verifies environment variables and performs minimal connectivity checks for your configured
                  services.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row
                    name="Environment"
                    present={Boolean(
                      status?.supabase.urlPresent &&
                        status?.supabase.anonPresent &&
                        status?.supabase.serviceRolePresent,
                    )}
                    ok={Boolean(
                      status?.supabase.urlPresent &&
                        status?.supabase.anonPresent &&
                        status?.supabase.serviceRolePresent,
                    )}
                    note="SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY) must be set."
                    missingEnv={supabaseMissing}
                  />
                  <Row
                    name="Database Connectivity"
                    present
                    ok={Boolean(status?.supabase.canQuery)}
                    error={status?.supabase.error}
                    note={
                      status?.supabase.canQuery
                        ? "Clients/Tasks/Orders tables are reachable."
                        : "Create tables or check credentials."
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Postgres (Neon)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row
                    name="Environment"
                    present={Boolean(
                      process.env.POSTGRES_PRISMA_URL ||
                        process.env.POSTGRES_URL ||
                        process.env.POSTGRES_URL_NON_POOLING,
                    )}
                    ok={Boolean(
                      process.env.POSTGRES_PRISMA_URL ||
                        process.env.POSTGRES_URL ||
                        process.env.POSTGRES_URL_NON_POOLING,
                    )}
                    note="POSTGRES_PRISMA_URL or POSTGRES_URL (or POSTGRES_URL_NON_POOLING) should be set."
                    missingEnv={neonMissing}
                  />
                  <Row
                    name="Connectivity"
                    present={Boolean(status?.neon.present)}
                    ok={Boolean(status?.neon.ok || !status?.neon.present)}
                    error={status?.neon.error}
                    note={
                      status?.neon.present
                        ? status?.neon.ok
                          ? "select 1 succeeded."
                          : "Connectivity failed."
                        : "Optional. Skipped."
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upstash Search</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row
                    name="Environment"
                    present={Boolean(
                      process.env.UPSTASH_SEARCH_REST_URL &&
                        (process.env.UPSTASH_SEARCH_REST_TOKEN || process.env.UPSTASH_SEARCH_REST_READONLY_TOKEN),
                    )}
                    ok={Boolean(
                      process.env.UPSTASH_SEARCH_REST_URL &&
                        (process.env.UPSTASH_SEARCH_REST_TOKEN || process.env.UPSTASH_SEARCH_REST_READONLY_TOKEN),
                    )}
                    note="UPSTASH_SEARCH_REST_URL and UPSTASH_SEARCH_REST_TOKEN (or READONLY) should be set."
                    missingEnv={upstashMissing}
                  />
                  <Row
                    name="Connectivity"
                    present
                    ok={Boolean(status?.upstashSearch.ok)}
                    note={status?.upstashSearch.note}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row
                    name="Environment"
                    present={Boolean(process.env.RESEND_API_KEY && process.env.SUPPORT_INBOX_EMAIL)}
                    ok={Boolean(process.env.RESEND_API_KEY && process.env.SUPPORT_INBOX_EMAIL)}
                    note="RESEND_API_KEY and SUPPORT_INBOX_EMAIL should be set."
                    missingEnv={resendMissing}
                  />
                  <Row
                    name="Connectivity"
                    present
                    ok={Boolean(status?.resend.ok)}
                    note={status?.resend.note}
                    error={status?.resend.error}
                  />
                </CardContent>
              </Card>
            </div>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle>Manual checks</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    readOnly
                    value={process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postgres-url">Postgres URL</Label>
                  <Input
                    id="postgres-url"
                    readOnly
                    value={
                      process.env.POSTGRES_PRISMA_URL ||
                      process.env.POSTGRES_URL ||
                      process.env.POSTGRES_URL_NON_POOLING ||
                      ""
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
