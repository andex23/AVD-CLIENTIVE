"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BellDot, ChevronRight, CreditCard, LogOut, Package2, Settings2, Sparkles, User2 } from "lucide-react"
import { AppChrome } from "@/components/app-chrome"
import type { AppNavKey } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAppSession } from "@/hooks/use-app-session"
import { SettingsProvider, useSettings } from "@/hooks/use-settings"

function SettingsContent() {
  const router = useRouter()
  const { settings, updateSettings } = useSettings()
  const { loading, userName, userEmail, isPreview, signOut } = useAppSession()

  const handleNavigate = (key: AppNavKey) => {
    if (key === "settings") return
    if (key === "today") {
      router.push(isPreview ? "/dashboard?preview=1" : "/dashboard")
      return
    }

    const params = new URLSearchParams()
    params.set("tab", key)
    if (isPreview) params.set("preview", "1")
    router.push(`/dashboard?${params.toString()}`)
  }

  if (loading && !isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="page-shell grid min-h-screen place-items-center py-16">
          <Card className="card-primary w-full max-w-md">
            <div className="flex flex-col gap-3 p-8 text-center">
              <p className="section-label m-0 mx-auto">Loading</p>
              <h1 className="font-sans text-2xl font-semibold tracking-[-0.04em]">Preparing your workspace settings</h1>
              <p className="text-sm leading-6 text-muted-foreground">Checking your session and restoring the preferences for this workspace.</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <AppChrome
      active="settings"
      onNavigate={handleNavigate}
      sectionLabel={isPreview ? "Preview workspace" : userName}
      title="Settings"
      description="Workspace controls, reminder behavior, and account details in one calmer view."
      userName={userName}
      userEmail={userEmail}
      isPreview={isPreview}
      status={
        <p>{settings.orderTrackingEnabled ? "Orders enabled." : "Orders off."} {settings.emailNotificationsEnabled ? "Email reminders active." : "Reminders stay in-app."}</p>
      }
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href={isPreview ? "/dashboard?preview=1" : "/dashboard"}>Back to workspace</Link>
          </Button>
          <Button asChild>
            <Link href="/demo">Open demo</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden border-t border-border">
          <div className="border-b border-border px-5 py-4">
            <p className="ui-kicker">Workspace controls</p>
            <h2 className="mt-1 font-sans text-lg font-semibold text-foreground">Core behavior</h2>
          </div>
          <div className="space-y-3 p-4">
            <SettingRow
              icon={Package2}
              title="Order tracking"
              description="Keep orders available as an optional module. Turn them on only when you need revenue pulse and purchase history."
              control={
                <Switch
                  checked={settings.orderTrackingEnabled}
                  onCheckedChange={(checked) => updateSettings({ orderTrackingEnabled: checked })}
                  aria-label="Toggle order tracking"
                />
              }
            />
            <SettingRow
              icon={BellDot}
              title="Email reminders"
              description="Enable reminder emails for future follow-ups so important client touches do not slip."
              control={
                <Switch
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={(checked) => updateSettings({ emailNotificationsEnabled: checked })}
                  aria-label="Toggle email notifications"
                />
              }
            />
            <div className="border-t border-border pt-4">
              <p className="ui-kicker">Preference summary</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Orders</p>
                  <p className="ui-meta mt-1">{settings.orderTrackingEnabled ? "Enabled and visible across the workspace." : "Off until you actively need it."}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reminders</p>
                  <p className="ui-meta mt-1">{settings.emailNotificationsEnabled ? "Email task reminders are active." : "Reminders stay inside the app only."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden border-t border-border">
            <div className="border-b border-border px-5 py-4">
              <p className="ui-kicker">Account</p>
              <h2 className="mt-1 font-sans text-lg font-semibold text-foreground">Who this workspace belongs to</h2>
            </div>
            <div className="space-y-3 p-4">
              <div className="border-b border-border pb-3">
                <Label className="ui-kicker">Name</Label>
                <p className="mt-2 text-sm font-medium text-foreground">{userName}</p>
              </div>
              <div className="border-b border-border pb-3">
                <Label className="ui-kicker">Email</Label>
                <p className="mt-2 text-sm font-medium text-foreground">{userEmail || "Preview workspace"}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="overflow-hidden border-t border-border">
            <div className="border-b border-border px-5 py-4">
              <p className="ui-kicker">Fast paths</p>
              <h2 className="mt-1 font-sans text-lg font-semibold text-foreground">Secondary links</h2>
            </div>
            <div className="space-y-2 p-3">
              <FastPath href="/" title="Home" body="Return to the simpler public product story." />
              <FastPath href="/demo" title="Guided demo" body="Walk the sample workspace without touching your live data." />
              <FastPath href="/support" title="Support" body="Get help, report issues, or ask for setup guidance." />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <p className="ui-kicker">Workspace posture</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                CLIENTIVE stays focused on one solo-service workspace: clear follow-ups, visible relationships, and orders only when the business actually needs them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppChrome>
  )
}

function SettingRow({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: typeof Settings2
  title: string
  description: string
  control: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="ui-meta mt-1 max-w-xl">{description}</p>
        </div>
      </div>
      <div className="pt-1">{control}</div>
    </div>
  )
}

function FastPath({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="flex items-center justify-between border-b border-border px-1 py-3 transition-colors hover:text-foreground">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="ui-meta mt-1">{body}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}

export default function DashboardSettingsPage() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  )
}
