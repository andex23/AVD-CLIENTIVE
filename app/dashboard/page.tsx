"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, Download, Upload, Users, Calendar, Bell, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ClientList } from "@/components/client-list"
import { TaskList } from "@/components/task-list"
import { OrderList } from "@/components/order-list"
import RecentActivity from "@/components/recent-activity"
import { AddClientDialog } from "@/components/add-client-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { AddOrderDialog } from "@/components/add-order-dialog"
import { ExportDialog } from "@/components/export-dialog"
import { FilterDialog } from "@/components/filter-dialog"

import { ClientsProvider, useClients } from "@/hooks/use-clients"
import { TasksProvider, useTasks } from "@/hooks/use-tasks"
import { OrdersProvider, useOrders } from "@/hooks/use-orders"
import { SettingsProvider, useSettings } from "@/hooks/use-settings"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

type NavKey = "overview" | "clients" | "tasks" | "orders" | "settings"

function DashboardInner({
  tab,
  setTab,
}: {
  tab: "clients" | "tasks" | "orders"
  setTab: (t: "clients" | "tasks" | "orders") => void
}) {
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddClient, setShowAddClient] = useState(false)
  const [showImportClients, setShowImportClients] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const [userName, setUserName] = useState("Jane")
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  const { clients, filteredClients, searchClients, filterClients, recentClients } = useClients()
  const { tasks, todaysTasks, upcomingTasks } = useTasks()
  const { orders, inactiveClients } = useOrders()
  const { settings, updateSettings } = useSettings()

  const signOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    } finally {
      try {
        localStorage.removeItem("crm:userName")
      } catch {}
      router.replace("/auth/sign-in")
    }
  }

  useEffect(() => {
    searchClients(searchQuery)
  }, [searchQuery, searchClients])

  // Listen for global CTAs from inner components (empty states)
  useEffect(() => {
    const onOpenTask = () => setShowAddTask(true)
    const onOpenOrder = () => setShowAddOrder(true)
    window.addEventListener("open-add-task", onOpenTask as EventListener)
    window.addEventListener("open-add-order", onOpenOrder as EventListener)
    return () => {
      window.removeEventListener("open-add-task", onOpenTask as EventListener)
      window.removeEventListener("open-add-order", onOpenOrder as EventListener)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const seen = typeof window !== "undefined" ? localStorage.getItem("crm:hasVisited") : "1"
        setIsFirstVisit(!seen)
        localStorage.setItem("crm:hasVisited", "1")
      } catch {
        setIsFirstVisit(false)
      }

      try {
        let name = ""
        if (typeof window !== "undefined") {
          name = localStorage.getItem("crm:userName") || ""
        }
        if (!name) {
          const supabase = getSupabaseBrowserClient()
          const { data } = await supabase.auth.getUser()
          const meta = data?.user?.user_metadata || {}
          const rawName = meta.full_name || meta.name || ""
          const email = data?.user?.email || ""
          const fallback = email ? email.split("@")[0] : ""
          name = (rawName || fallback || "Jane").toString()
        }
        setUserName(name)
      } catch {
        // keep default
      }
    }
    init()
  }, [])

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "active").length,
    todaysTasks: todaysTasks.length,
    recentClients: recentClients.length,
    totalOrders: orders.length,
    inactiveCustomers: inactiveClients.length,
  }

  return (
    <SidebarInset>
      {/* Top bar with navy background and white text + SidebarTrigger toggler */}
      <div className="border-b bg-slate-900 text-white">
        <div className="flex h-16 items-center px-4">
          <SidebarTrigger className="-ml-1 mr-2" />
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-semibold font-mono tracking-wide">AVD CLIENTIVE</h1>
          </div>
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Switch
                className="bg-orange-600"
                id="order-tracking"
                checked={settings.orderTrackingEnabled}
                onCheckedChange={(checked) => updateSettings({ orderTrackingEnabled: checked })}
              />
              <Label htmlFor="order-tracking" className="text-sm font-sans text-white">
                Order Tracking
              </Label>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/70" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px] sm:w-[240px] md:w-[300px] bg-slate-800 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilter(true)}
              className="border-white/30 hover:bg-white/10 text-black bg-white"
            >
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            {/* Explicit mobile menu trigger for visibility */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden text-white hover:bg-white/10"
              onClick={toggleSidebar}
              aria-label="Open menu"
            >
              Menu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportClients(true)}
              className="border-white/30 text-white hover:bg-white/10 bg-black"
            >
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(true)}
              className="border-white/30 hover:bg-white/10 text-black"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              title="Sign out"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 p-4 pt-6">
        {/* Overview greeting */}
        <div id="overview" className="rounded-lg border bg-gradient-to-r from-orange-50 to-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight truncate">
                {isFirstVisit ? `Hi ${userName}` : `Welcome back, ${userName}`}
              </h2>
              <p className="text-sm text-muted-foreground">{"Here's what's happening today."}</p>
            </div>
            <span className="hidden sm:block text-xs md:text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <div className="h-9 w-9 rounded-md bg-slate-900 text-white grid place-items-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">{stats.activeClients} active</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <div className="h-9 w-9 rounded-md bg-slate-900 text-white grid place-items-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaysTasks}</div>
              <p className="text-xs text-muted-foreground">{upcomingTasks.length} upcoming</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Clients</CardTitle>
              <div className="h-9 w-9 rounded-md bg-slate-900 text-white grid place-items-center">
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentClients}</div>
              <p className="text-xs text-muted-foreground">Added this week</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
              <div className="h-9 w-9 rounded-md bg-orange-500 text-white grid place-items-center">
                <Bell className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inactiveCustomers}</div>
              <p className="text-xs text-muted-foreground">No order in 30+ days</p>
            </CardContent>
          </Card>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="h-px w-full bg-muted" />
        </div>

        {/* Today + Recent */}
        <section aria-label="Today and Recent" className="grid gap-4 md:grid-cols-2">
          <RecentActivity clients={clients} tasks={tasks} orders={orders} userName={userName} />
        </section>

        <div className="grid gap-4">
          <div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="clients" className="flex-1 sm:flex-none">
                    Clients
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex-1 sm:flex-none">
                    Tasks & Follow-ups
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex-1 sm:flex-none">
                    Orders
                  </TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap gap-2">
                  {tab === "clients" && (
                    <>
                      <Button variant="outline" onClick={() => setShowImportClients(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                      <Button onClick={() => setShowAddClient(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Button>
                    </>
                  )}
                  {tab === "tasks" && (
                    <Button onClick={() => setShowAddTask(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                  {tab === "orders" && (
                    <Button onClick={() => setShowAddOrder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Order
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="clients" className="space-y-4">
                <ClientList clients={filteredClients} orderTrackingEnabled={true} />
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <TaskList tasks={tasks} clients={clients} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <OrderList orders={orders} clients={clients} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddClientDialog open={showAddClient} onOpenChange={setShowAddClient} />
      <ImportDialog open={showImportClients} onOpenChange={setShowImportClients} />
      <AddTaskDialog open={showAddTask} onOpenChange={setShowAddTask} clients={clients} />
      <AddOrderDialog open={showAddOrder} onOpenChange={setShowAddOrder} clients={clients} />
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        clients={clients}
        orders={orders}
        orderTrackingEnabled={true}
      />
      <FilterDialog
        open={showFilter}
        onOpenChange={setShowFilter}
        onFilter={filterClients}
        orderTrackingEnabled={true}
      />
    </SidebarInset>
  )
}

export default function DashboardPage() {
  const router = useRouter()

  // Sidebar-controlled navigation state
  const [active, setActive] = useState<NavKey>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search)
      const t = sp.get("tab") as NavKey | null
      if (t === "clients" || t === "tasks" || t === "orders") return t
    }
    return "clients"
  })
  const tab = active === "overview" || active === "settings" ? "clients" : (active as "clients" | "tasks" | "orders")

  const handleNavigate = (key: NavKey) => {
    setActive(key)
    if (key === "overview") {
      if (typeof window !== "undefined") {
        const el = document.getElementById("overview")
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        else window.scrollTo({ top: 0, behavior: "smooth" })
      }
      return
    }
    if (key === "settings") {
      router.push("/dashboard/settings")
      return
    }
    // for clients/tasks/orders, also update the URL tab param for direct linking
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", key)
      window.history.replaceState(null, "", url.toString())
    }
  }

  // Enforce auth in production
  useEffect(() => {
    const check = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
          router.replace("/auth/sign-in")
        }
      } catch {
        router.replace("/auth/sign-in")
      }
    }
    check()
  }, [router])

  return (
    <SidebarProvider>
      <AppSidebar active={active} onNavigate={handleNavigate} />
      <SettingsProvider>
        <OrdersProvider>
          <TasksProvider>
            <ClientsProvider>
              <DashboardInner tab={tab} setTab={(t) => setActive(t)} />
            </ClientsProvider>
          </TasksProvider>
        </OrdersProvider>
      </SettingsProvider>
    </SidebarProvider>
  )
}
