"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, ShieldAlert } from "lucide-react"
import { useTheme } from "next-themes"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { PersistentSidebarProvider } from "@/components/persistent-sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

import { ImportDialog } from "@/components/import-dialog"
import { ExportDialog } from "@/components/export-dialog"

import { SettingsProvider, useSettings } from "@/hooks/use-settings"
import { ClientsProvider, useClients } from "@/hooks/use-clients"
import { OrdersProvider, useOrders } from "@/hooks/use-orders"

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="py-8">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function SettingsContent() {
  const router = useRouter()
  const { toast } = useToast()

  // Theme
  const { setTheme, resolvedTheme } = useTheme()
  const [prefThemeDark, setPrefThemeDark] = React.useState(false)

  // Settings store (notifications or other future settings)
  const { settings, updateSettings } = useSettings()
  const [notificationsOn, setNotificationsOn] = React.useState<boolean>(settings.emailNotificationsEnabled ?? false)

  // Profile info
  const [name, setName] = React.useState("Jane Doe")
  const [email, setEmail] = React.useState("jane@example.com")

  // Data dialogs (need clients/orders from providers)
  const { clients } = useClients()
  const { orders } = useOrders()
  const [openImport, setOpenImport] = React.useState(false)
  const [openExport, setOpenExport] = React.useState(false)

  // Dirty state
  const [dirty, setDirty] = React.useState(false)

  // Supabase client-side check
  const supabaseConfigured =
    typeof process !== "undefined" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Initialize theme toggle to current theme
  React.useEffect(() => {
    if (resolvedTheme) setPrefThemeDark(resolvedTheme === "dark")
  }, [resolvedTheme])

  // Load profile from Supabase/local
  React.useEffect(() => {
    const init = async () => {
      try {
        let localName = ""
        if (typeof window !== "undefined") {
          localName = localStorage.getItem("crm:userName") || ""
        }
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase.auth.getUser()
        const meta = data?.user?.user_metadata || {}
        const rawName = (meta.full_name || meta.name || localName || "Jane Doe").toString()
        const userEmail = data?.user?.email || "jane@example.com"
        setName(rawName)
        setEmail(userEmail)
      } catch {
        // demo fallback
      }
    }
    init()
  }, [])

  // Track dirtiness
  React.useEffect(() => {
    setDirty(true)
  }, [prefThemeDark, notificationsOn])

  const onSave = async () => {
    try {
      // Apply and persist theme immediately
      setTheme(prefThemeDark ? "dark" : "light")

      // Persist notifications via settings store (and optionally localStorage)
      updateSettings({ emailNotificationsEnabled: notificationsOn })
      if (typeof window !== "undefined") {
        localStorage.setItem("crm:notificationsOn", JSON.stringify(notificationsOn))
      }

      setDirty(false)
      toast({ title: "Settings saved", description: "Your preferences have been updated." })
    } catch (e: any) {
      toast({ title: "Unable to save", description: e?.message || "Please try again.", variant: "destructive" })
    }
  }

  const onChangePassword = async () => {
    if (!supabaseConfigured) {
      toast({ title: "Demo mode", description: "Password change is disabled in demo mode." })
      return
    }
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/update-password` : undefined,
      })
      toast({ title: "Email sent", description: "Check your inbox for the password reset link." })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not send reset email.", variant: "destructive" })
    }
  }

  const onDeleteAccount = async () => {
    if (!supabaseConfigured) {
      toast({ title: "Demo mode", description: "Account deletion is disabled in demo mode." })
      return
    }
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: sess } = await supabase.auth.getSession()
      const token = sess.session?.access_token
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed with ${res.status}`)
      }
      await supabase.auth.signOut()
      toast({ title: "Account deleted", description: "Your account has been removed." })
      router.replace("/")
    } catch (e: any) {
      toast({ title: "Deletion failed", description: e?.message || "Please try again.", variant: "destructive" })
    }
  }

  return (
    <SidebarInset>
      {/* Navy top bar with sidebar trigger */}
      <div className="border-b bg-slate-900 text-white">
        <div className="flex h-16 items-center px-4">
          <SidebarTrigger className="-ml-1 mr-2" />
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-semibold tracking-wide">Settings</h1>
          </div>
          <div className="ml-auto" />
        </div>
      </div>

      {/* Content: white background, light gray dividers; dark equivalents via dark: classes */}
      <div className="bg-white dark:bg-neutral-900">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          <div className="divide-y divide-gray-200 dark:divide-neutral-800">
            {/* Profile */}
            <Section title="Profile" description="Manage your personal information and account security.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} readOnly aria-readonly className="bg-muted/30" />
                  <p className="text-xs text-muted-foreground">Name is managed via your authentication provider.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} readOnly aria-readonly className="bg-muted/30" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={onChangePassword} disabled={!supabaseConfigured}>
                  Change password
                </Button>
                {!supabaseConfigured && <p className="mt-2 text-xs text-muted-foreground">Disabled in demo mode.</p>}
              </div>
            </Section>

            {/* Preferences */}
            <Section title="Preferences" description="Light/dark theme and notifications.">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pref-theme" className="font-medium">
                      Theme
                    </Label>
                    <p className="text-sm text-muted-foreground">Switch between Light and Dark mode.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Light</span>
                    <Switch
                      id="pref-theme"
                      checked={prefThemeDark}
                      onCheckedChange={(checked) => {
                        setPrefThemeDark(checked)
                        setTheme(checked ? "dark" : "light")
                      }}
                      aria-label="Toggle dark mode"
                    />
                    <span className="text-sm">Dark</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pref-notifications" className="font-medium">
                      Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about your tasks.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Off</span>
                    <Switch
                      id="pref-notifications"
                      checked={notificationsOn}
                      onCheckedChange={setNotificationsOn}
                      aria-label="Toggle notifications"
                    />
                    <span className="text-sm">On</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Data */}
            <Section title="Data" description="Import clients and export your data.">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => setOpenImport(true)} aria-label="Import clients CSV">
                  Import clients (CSV)
                </Button>
                <Button onClick={() => setOpenExport(true)} aria-label="Export all data">
                  Export all data
                </Button>
              </div>
              <ImportDialog open={openImport} onOpenChange={setOpenImport} />
              <ExportDialog
                open={openExport}
                onOpenChange={setOpenExport}
                clients={clients}
                orders={orders}
                orderTrackingEnabled={true}
              />
            </Section>

            {/* Danger Zone */}
            <Section title="Danger Zone" description="These actions are permanent and cannot be undone.">
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium">Delete account</h3>
                    <p className="text-sm opacity-90">This will permanently remove your account and associated data.</p>
                    <div className="mt-3">
                      <Button variant="destructive" onClick={onDeleteAccount} disabled={!supabaseConfigured}>
                        Delete account
                      </Button>
                      {!supabaseConfigured && <p className="mt-2 text-xs opacity-80">Disabled in demo mode.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Save button fixed at bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={onSave} disabled={!dirty} aria-label="Save changes">
          Save changes
        </Button>
      </div>
    </SidebarInset>
  )
}

export default function SettingsPage() {
  const router = useRouter()

  // Sidebar navigation handler
  const handleNavigate = (key: "overview" | "clients" | "tasks" | "orders" | "settings") => {
    if (key === "settings") return
    if (key === "overview") {
      router.push("/dashboard#overview")
      return
    }
    const tabMap: Record<string, string> = { clients: "clients", tasks: "tasks", orders: "orders" }
    const tab = tabMap[key] || "clients"
    router.push(`/dashboard?tab=${encodeURIComponent(tab)}`)
  }

  return (
    <PersistentSidebarProvider>
      <AppSidebar active="settings" onNavigate={handleNavigate} />
      <SettingsProvider>
        <OrdersProvider>
          <ClientsProvider>
            <SettingsContent />
          </ClientsProvider>
        </OrdersProvider>
      </SettingsProvider>
    </PersistentSidebarProvider>
  )
}
