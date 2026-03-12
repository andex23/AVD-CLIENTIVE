"use client"

import type React from "react"
import { type ComponentType, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BellDot,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Download,
  ListTodo,
  Mail,
  MessageCircle,
  Package2,
  PhoneCall,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { AddClientDialog } from "@/components/add-client-dialog"
import { AddOrderDialog } from "@/components/add-order-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { AppChrome } from "@/components/app-chrome"
import type { AppNavKey } from "@/components/app-sidebar"
import { ClientList } from "@/components/client-list"
import { ExportDialog } from "@/components/export-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { OrderList } from "@/components/order-list"
import { TaskList } from "@/components/task-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppSession } from "@/hooks/use-app-session"
import { ClientsProvider, useClients } from "@/hooks/use-clients"
import { OrdersProvider, useOrders } from "@/hooks/use-orders"
import { SettingsProvider, useSettings } from "@/hooks/use-settings"
import { TasksProvider, useTasks } from "@/hooks/use-tasks"
import { formatDateShort, formatTimeHM, isOverdue, isToday, safeDate, timeAgo } from "@/lib/date"
import { formatEnumLabel, getClientAttentionState } from "@/lib/workspace-ui"
import type { Client } from "@/types/client"

type WorkspaceTab = "today" | "clients" | "tasks" | "orders"

function parseTab(value: string | null): WorkspaceTab {
  if (value === "clients" || value === "tasks" || value === "orders" || value === "today") return value
  return "today"
}

function getFirstName(name: string) {
  const trimmed = name.trim()
  if (!trimmed || trimmed.toLowerCase() === "preview workspace") return ""
  return trimmed.split(/\s+/)[0] || ""
}

function getTimeGreeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  if (hour < 22) return "Good evening"
  return "Working late"
}

function openWhatsApp(client: Client) {
  if (!client.phone) return
  const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, "")}?text=Hi ${client.name}, `
  window.open(whatsappUrl, "_blank", "noopener,noreferrer")
}

function callClient(client: Client) {
  if (!client.phone) return
  window.open(`tel:${client.phone}`, "_self")
}

function emailClient(client: Client) {
  window.open(`mailto:${client.email}?subject=Follow up&body=Hi ${client.name},%0D%0A%0D%0A`, "_self")
}

function DashboardWorkspace({
  active,
  setActive,
}: {
  active: WorkspaceTab
  setActive: (tab: WorkspaceTab) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading, userName, userEmail, isPreview } = useAppSession()
  const [showAddClient, setShowAddClient] = useState(false)
  const [showImportClients, setShowImportClients] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const { clients, recentClients } = useClients()
  const { tasks, todaysTasks, upcomingTasks } = useTasks()
  const { orders, inactiveClients } = useOrders()
  const { settings } = useSettings()

  useEffect(() => {
    const onOpenClient = () => setShowAddClient(true)
    const onOpenTask = () => setShowAddTask(true)
    const onOpenOrder = () => setShowAddOrder(true)

    window.addEventListener("open-add-client", onOpenClient as EventListener)
    window.addEventListener("open-add-task", onOpenTask as EventListener)
    window.addEventListener("open-add-order", onOpenOrder as EventListener)

    return () => {
      window.removeEventListener("open-add-client", onOpenClient as EventListener)
      window.removeEventListener("open-add-task", onOpenTask as EventListener)
      window.removeEventListener("open-add-order", onOpenOrder as EventListener)
    }
  }, [])

  const overdueTasks = useMemo(
    () => tasks.filter((task) => isOverdue(task.dueDate, task.completed)).sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0)),
    [tasks],
  )
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks])
  const nextTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completed && !isOverdue(task.dueDate) && !isToday(task.dueDate))
        .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0))
        .slice(0, 5),
    [tasks],
  )
  const focusQueue = useMemo(() => {
    const seen = new Set<string>()
    return [...overdueTasks, ...todaysTasks, ...nextTasks].filter((task) => {
      if (seen.has(task.id)) return false
      seen.add(task.id)
      return true
    }).slice(0, 6)
  }, [nextTasks, overdueTasks, todaysTasks])
  const attentionClients = useMemo(
    () =>
      clients
        .filter((client) => {
          const state = getClientAttentionState(client, tasks)
          return state.label === "Follow-up overdue" || state.label === "Needs touch"
        })
        .sort((a, b) => (safeDate(a.lastContact)?.getTime() ?? 0) - (safeDate(b.lastContact)?.getTime() ?? 0))
        .slice(0, 5),
    [clients, tasks],
  )
  const recentTouches = useMemo(
    () =>
      [...clients]
        .sort((a, b) => (safeDate(b.lastContact)?.getTime() ?? 0) - (safeDate(a.lastContact)?.getTime() ?? 0))
        .slice(0, 5),
    [clients],
  )
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => (safeDate(b.date)?.getTime() ?? 0) - (safeDate(a.date)?.getTime() ?? 0)).slice(0, 4),
    [orders],
  )
  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    return orders
      .filter((order) => {
        const date = safeDate(order.date)
        return !!date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((total, order) => total + order.amount, 0)
  }, [orders])
  const pipelineRevenue = useMemo(
    () => orders.filter((order) => order.status === "pending" || order.status === "processing").reduce((total, order) => total + order.amount, 0),
    [orders],
  )
  const activityFeed = useMemo(() => {
    const items = [
      ...recentTouches.map((client) => ({
        id: `client-${client.id}`,
        label: client.name,
        detail: client.company || client.email,
        timestamp: client.lastContact,
        type: "Touchpoint",
      })),
      ...completedTasks.slice(0, 3).map((task) => ({
        id: `task-${task.id}`,
        label: task.title,
        detail: `${formatEnumLabel(task.type)} closed`,
        timestamp: task.dueDate,
        type: "Task",
      })),
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        label: order.product,
        detail: `$${order.amount.toFixed(0)} · ${getClientName(order.clientId, clients)}`,
        timestamp: order.date,
        type: "Order",
      })),
    ]
    return items.sort((a, b) => (safeDate(b.timestamp)?.getTime() ?? 0) - (safeDate(a.timestamp)?.getTime() ?? 0)).slice(0, 6)
  }, [clients, completedTasks, recentOrders, recentTouches])

  const activeClientsCount = clients.filter((client) => client.status === "active" || client.status === "vip").length
  const warmClientsCount = clients.filter((client) => client.status === "lead" || client.status === "prospect").length
  const now = new Date()
  const todayLabel = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  const workspaceLabel = isPreview ? "Preview workspace" : userName
  const dailySummary = `${overdueTasks.length} follow-up${overdueTasks.length === 1 ? "" : "s"} overdue. ${todaysTasks.length} task${todaysTasks.length === 1 ? "" : "s"} due today.`
  const firstName = getFirstName(userName)
  const greeting = getTimeGreeting(now)
  const todayHeading = firstName ? `${greeting}, ${firstName}.` : todayLabel
  const todayDescription = firstName ? `${todayLabel}. ${dailySummary}` : `This is what you have today. ${dailySummary}`

  const navigate = (key: AppNavKey) => {
    if (key === "settings") {
      const params = new URLSearchParams()
      if (isPreview) params.set("preview", "1")
      const suffix = params.toString()
      router.push(`/dashboard/settings${suffix ? `?${suffix}` : ""}`)
      return
    }

    const nextTab = key as WorkspaceTab
    setActive(nextTab)
    const params = new URLSearchParams(searchParams.toString())
    if (nextTab === "today") params.delete("tab")
    else params.set("tab", nextTab)
    if (isPreview) params.set("preview", "1")
    const nextQuery = params.toString()
    router.replace(`/dashboard${nextQuery ? `?${nextQuery}` : ""}`)
  }

  if (loading && !isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="page-shell grid min-h-screen place-items-center py-16">
          <Card className="card-primary w-full max-w-lg">
            <div className="space-y-3 p-8 text-center">
              <p className="section-label m-0 mx-auto">Loading</p>
              <h1 className="font-sans text-2xl font-semibold tracking-[-0.04em]">Preparing your CLIENTIVE workspace</h1>
              <p className="text-sm leading-6 text-muted-foreground">Restoring your queue, relationships, and workspace modules.</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const status =
    active === "clients" ? (
      <p>{attentionClients.length} relationships need attention.</p>
    ) : active === "tasks" ? (
      <p>{overdueTasks.length} overdue, {todaysTasks.length} due today.</p>
    ) : active === "orders" ? (
      <p>
        {settings.orderTrackingEnabled ? `${orders.length} tracked orders. $${monthlyRevenue.toFixed(0)} booked this month.` : "Orders are optional and currently off."}
      </p>
    ) : (
      <p>{activeClientsCount} active clients. {warmClientsCount} warm leads still in motion.</p>
    )

  const actions =
    active === "clients" ? (
      <>
        <Button variant="outline" onClick={() => setShowImportClients(true)}>
          Import
        </Button>
        <Button onClick={() => setShowAddClient(true)}>
          <UserPlus className="h-4 w-4" />
          New client
        </Button>
      </>
    ) : active === "tasks" ? (
      <>
        <Button variant="outline" onClick={() => setShowExport(true)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </>
    ) : active === "orders" ? (
      settings.orderTrackingEnabled ? (
        <>
          <Button variant="outline" onClick={() => setShowExport(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddOrder(true)}>
            <Plus className="h-4 w-4" />
            Add order
          </Button>
        </>
      ) : (
        <Button onClick={() => navigate("settings")}>
          Enable orders
          <ArrowRight className="h-4 w-4" />
        </Button>
      )
    ) : (
      <>
        <Button variant="outline" onClick={() => setShowExport(true)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" onClick={() => setShowAddClient(true)}>
          <UserPlus className="h-4 w-4" />
          New client
        </Button>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </>
    )

  return (
    <>
      <AppChrome
        active={active}
        onNavigate={navigate}
        sectionLabel={active === "today" ? todayLabel : workspaceLabel}
        title={
          active === "today"
            ? todayHeading
            : active === "clients"
              ? "Clients"
              : active === "tasks"
                ? "Tasks"
                : "Orders"
        }
        description={
          active === "today"
            ? todayDescription
            : active === "clients"
              ? "The relationship view for last contact, next action, and the context that matters before you reach out."
              : active === "tasks"
                ? "A calm execution queue for overdue, due-today, and upcoming follow-ups."
                : "Optional order visibility tied back to the same client record."
        }
        userName={userName}
        userEmail={userEmail}
        isPreview={isPreview}
        status={status}
        actions={actions}
      >
        {active === "today" ? (
          <div className="space-y-6">
            <MetricsGrid>
              <MetricTile icon={CircleAlert} label="Overdue" value={overdueTasks.length} detail="Needs attention first" tone="danger" />
              <MetricTile icon={CalendarClock} label="Today" value={todaysTasks.length} detail="Due in the current day" tone="brand" />
              <MetricTile icon={Users} label="Active clients" value={activeClientsCount} detail={`${warmClientsCount} warm leads in motion`} />
              <MetricTile
                icon={Package2}
                label={settings.orderTrackingEnabled ? "Revenue pulse" : "Orders module"}
                value={settings.orderTrackingEnabled ? `$${monthlyRevenue.toFixed(0)}` : "Off"}
                detail={settings.orderTrackingEnabled ? "Booked this month" : "Enable only when needed"}
              />
            </MetricsGrid>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
              <Card className="card-primary overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <p className="ui-kicker">Focus queue</p>
                  <h2 className="mt-1 font-sans text-lg font-semibold text-foreground">Focus queue</h2>
                </div>
                <div className="space-y-2 p-3">
                  {focusQueue.length > 0 ? (
                    focusQueue.map((task) => {
                      const client = clients.find((entry) => entry.id === task.clientId)
                      return (
                        <div key={task.id} className="border-b border-border/80 px-1 py-4 last:border-b-0">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{task.title}</p>
                                <Badge className={isOverdue(task.dueDate, task.completed) ? "border-transparent bg-destructive/10 text-destructive" : isToday(task.dueDate) ? "border-transparent bg-primary/10 text-primary" : "border-border/80 bg-[hsl(var(--surface-soft))] text-muted-foreground"}>
                                  {isOverdue(task.dueDate, task.completed) ? "Overdue" : isToday(task.dueDate) ? "Today" : "Upcoming"}
                                </Badge>
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">
                                {client ? `${client.name}${client.company ? ` · ${client.company}` : ""}` : "Client not found"} · {formatEnumLabel(task.type)} · {formatDateShort(task.dueDate)} at {formatTimeHM(task.dueDate)}
                              </p>
                              {task.description ? <p className="text-sm text-foreground/75">{task.description}</p> : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {client?.phone ? (
                                <Button size="sm" variant="outline" onClick={() => openWhatsApp(client)}>
                                  <MessageCircle className="h-4 w-4" />
                                  Message
                                </Button>
                              ) : null}
                              {client?.phone ? (
                                <Button size="sm" variant="outline" onClick={() => callClient(client)}>
                                  <PhoneCall className="h-4 w-4" />
                                  Call
                                </Button>
                              ) : null}
                              {client ? (
                                <Button size="sm" variant="outline" onClick={() => emailClient(client)}>
                                  <Mail className="h-4 w-4" />
                                  Email
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <EmptyState
                      title="No urgent queue"
                      body="Your follow-up queue is clear. Add the next task now so tomorrow starts with the same calm."
                      actionLabel="Add task"
                      onAction={() => setShowAddTask(true)}
                    />
                  )}
                </div>
              </Card>

              <aside className="space-y-5 border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                <section className="space-y-3">
                  <div>
                    <p className="ui-kicker">Clients needing attention</p>
                    <p className="mt-1 text-sm text-muted-foreground">Relationships that need a touch next.</p>
                  </div>
                  {attentionClients.length > 0 ? (
                    attentionClients.map((client) => {
                      const attention = getClientAttentionState(client, tasks)
                      return (
                        <div key={client.id} className="border-t border-border py-4 first:border-t-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="ui-meta mt-1">{client.company || client.email}</p>
                              <p className="ui-meta mt-2">Last contact {timeAgo(client.lastContact)}</p>
                            </div>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${attention.tone}`}>{attention.label}</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <EmptyState
                      title="Relationships are warm"
                      body="No client relationships are past the attention threshold right now."
                      actionLabel="Open client book"
                      onAction={() => navigate("clients")}
                    />
                  )}
                </section>

                <section className="space-y-3 border-t border-border pt-5">
                  <div>
                    <p className="ui-kicker">Next 7 days</p>
                    <p className="mt-1 text-sm text-muted-foreground">What is already planned.</p>
                  </div>
                  {nextTasks.length > 0 ? (
                    nextTasks.map((task) => (
                      <div key={task.id} className="border-t border-border py-4 first:border-t-0">
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="ui-meta mt-1">{getClientName(task.clientId, clients)} · {formatEnumLabel(task.type)}</p>
                        <p className="ui-meta mt-2">{formatDateShort(task.dueDate)} at {formatTimeHM(task.dueDate)}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No upcoming work queued"
                      body="Create the next follow-up before you leave today so tomorrow starts with a plan."
                      actionLabel="Plan next task"
                      onAction={() => setShowAddTask(true)}
                    />
                  )}
                </section>

                <section className="space-y-3 border-t border-border pt-5">
                  <div>
                    <p className="ui-kicker">Recent activity</p>
                    <p className="mt-1 text-sm text-muted-foreground">Movement across the workspace.</p>
                  </div>
                  {activityFeed.map((item) => (
                    <div key={item.id} className="border-t border-border py-4 first:border-t-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <span className="ui-meta">{item.type}</span>
                      </div>
                      <p className="ui-meta mt-1">{item.detail}</p>
                      <p className="ui-meta mt-2">{timeAgo(item.timestamp)}</p>
                    </div>
                  ))}
                </section>

                <section className="space-y-3 border-t border-border pt-5">
                  <div>
                    <p className="ui-kicker">Order pulse</p>
                    <p className="mt-1 text-sm text-muted-foreground">Optional business visibility.</p>
                  </div>
                  {settings.orderTrackingEnabled ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                        <div>
                          <p className="ui-kicker">Booked this month</p>
                          <p className="mt-2 text-xl font-semibold text-foreground">${monthlyRevenue.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="ui-kicker">Pipeline</p>
                          <p className="mt-2 text-xl font-semibold text-foreground">${pipelineRevenue.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="border-t border-border py-3 first:border-t-0">
                            <p className="text-sm font-medium text-foreground">{order.product}</p>
                            <p className="ui-meta mt-1">{getClientName(order.clientId, clients)} · ${order.amount.toFixed(0)}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      title="Orders stay optional"
                      body="Turn them on only when you need revenue visibility or purchase history."
                      actionLabel="Open settings"
                      onAction={() => navigate("settings")}
                    />
                  )}
                </section>
              </aside>
            </div>
          </div>
        ) : active === "clients" ? (
          <div className="space-y-5">
            <MetricsGrid>
              <MetricTile icon={Users} label="Total clients" value={clients.length} detail={`${activeClientsCount} active or VIP`} />
              <MetricTile icon={UserPlus} label="Added recently" value={recentClients.length} detail="Touched in the last 7 days" tone="brand" />
              <MetricTile icon={BellDot} label="Needs attention" value={attentionClients.length} detail="Needs a touch or overdue task" tone="danger" />
              <MetricTile icon={Package2} label="Order history" value={settings.orderTrackingEnabled ? "On" : "Off"} detail={settings.orderTrackingEnabled ? "Visible inside client records" : "Still optional"} />
            </MetricsGrid>
            <ClientList clients={clients} orderTrackingEnabled={settings.orderTrackingEnabled} />
          </div>
        ) : active === "tasks" ? (
          <div className="space-y-5">
            <MetricsGrid>
              <MetricTile icon={CircleAlert} label="Overdue" value={overdueTasks.length} detail="Past due and blocking flow" tone="danger" />
              <MetricTile icon={CalendarClock} label="Due today" value={todaysTasks.length} detail="Commitments for the day" tone="brand" />
              <MetricTile icon={ListTodo} label="Upcoming" value={upcomingTasks.length} detail="Scheduled in the next 7 days" />
              <MetricTile icon={CheckCircle2} label="Completed" value={completedTasks.length} detail="Still visible for record" />
            </MetricsGrid>
            <TaskList tasks={tasks} clients={clients} />
          </div>
        ) : settings.orderTrackingEnabled ? (
          <div className="space-y-5">
            <MetricsGrid>
              <MetricTile icon={Package2} label="Tracked orders" value={orders.length} detail="Across the workspace" />
              <MetricTile icon={TrendingUp} label="Booked this month" value={`$${monthlyRevenue.toFixed(0)}`} detail="Recognized from tracked orders" tone="brand" />
              <MetricTile icon={BellDot} label="Inactive clients" value={inactiveClients.length} detail="No order in the last 30 days" tone="danger" />
              <MetricTile icon={Package2} label="Pipeline" value={`$${pipelineRevenue.toFixed(0)}`} detail="Pending and processing" />
            </MetricsGrid>
            <OrderList orders={orders} clients={clients} />
          </div>
        ) : (
          <Card className="card-primary">
            <div className="grid gap-5 p-8 lg:grid-cols-[0.7fr_0.3fr] lg:items-center">
              <div className="space-y-3">
                <p className="section-label m-0">Optional module</p>
                <h2 className="font-sans text-3xl font-semibold tracking-[-0.04em] text-foreground">Orders are currently turned off.</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  CLIENTIVE can stay focused on client relationships and follow-ups until you actively need order history or revenue visibility.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button variant="outline" asChild>
                  <Link href={isPreview ? "/dashboard/settings?preview=1" : "/dashboard/settings"}>Open settings</Link>
                </Button>
                <Button onClick={() => navigate("today")}>
                  Back to today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </AppChrome>

      <AddClientDialog open={showAddClient} onOpenChange={setShowAddClient} />
      <ImportDialog open={showImportClients} onOpenChange={setShowImportClients} />
      <AddTaskDialog open={showAddTask} onOpenChange={setShowAddTask} clients={clients} />
      <AddOrderDialog open={showAddOrder} onOpenChange={setShowAddOrder} clients={clients} />
      <ExportDialog open={showExport} onOpenChange={setShowExport} clients={clients} orders={orders} orderTrackingEnabled={settings.orderTrackingEnabled} />
    </>
  )
}

function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string | number
  detail: string
  tone?: "default" | "brand" | "danger"
}) {
  const badgeTone =
    tone === "brand" ? "bg-primary/10 text-primary" : tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-[hsl(var(--surface-soft))] text-foreground"

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tone === "brand" ? "text-primary" : tone === "danger" ? "text-destructive" : "text-muted-foreground"}`} />
        <p className="ui-kicker">{label}</p>
      </div>
      <p className="font-sans text-3xl font-semibold tracking-[-0.05em] text-foreground">{value}</p>
      <p className="ui-meta">{detail}</p>
    </div>
  )
}

function MetricsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 border-y border-border py-4 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  )
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string
  body: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="border border-dashed border-border px-4 py-4">
      <h3 className="font-sans text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      <Button className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}

function getClientName(clientId: string, clients: Client[]) {
  return clients.find((client) => client.id === clientId)?.name || "Unknown client"
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [active, setActive] = useState<WorkspaceTab>(() => parseTab(tabParam))

  useEffect(() => {
    setActive(parseTab(tabParam))
  }, [tabParam])

  return (
    <SettingsProvider>
      <OrdersProvider>
        <TasksProvider>
          <ClientsProvider>
            <DashboardWorkspace active={active} setActive={setActive} />
          </ClientsProvider>
        </TasksProvider>
      </OrdersProvider>
    </SettingsProvider>
  )
}
