"use client"

import { useMemo, useState } from "react"
import { CalendarClock, Package, Users2 } from "lucide-react"
import { demoClients, demoOrders, demoTasks } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

type DemoTab = "today" | "clients" | "tasks" | "orders"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function DemoWorkspace({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [tab, setTab] = useState<DemoTab>("today")
  const dueToday = useMemo(() => demoTasks.filter((task) => task.dueDate.startsWith("2026-03-12")), [])
  const primaryTask = demoTasks[0]
  const primaryClient = demoClients.find((client) => client.id === primaryTask.clientId) || demoClients[0]
  const primaryOrder = demoOrders[0]
  const openTasks = demoTasks.filter((task) => !task.completed)

  if (compact) {
    return (
      <div className={cn("overflow-hidden rounded-[18px] border border-border bg-card", className)}>
        <div className="grid lg:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-[linear-gradient(180deg,rgba(30,24,21,1),rgba(21,16,14,1))] px-4 py-5 text-white lg:border-b-0 lg:border-r">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Preview workspace</div>
            <div className="mt-5 space-y-2 text-sm text-white/68">
              {["Today", "Clients", "Tasks", "Orders"].map((label, index) => (
                <div key={label} className={cn("border-l px-3 py-1.5", index === 0 ? "border-primary text-white" : "border-white/10")}>
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Overdue</p>
                <p className="mt-1 text-2xl font-semibold">1</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Due today</p>
                <p className="mt-1 text-2xl font-semibold">{dueToday.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Orders</p>
                <p className="mt-1 text-2xl font-semibold">$4.6k</p>
              </div>
            </div>
          </aside>

          <div className="px-5 py-5 md:px-6">
            <div className="border-b border-border pb-4">
              <p className="section-label">Today</p>
              <h3 className="mt-2 font-sans text-[1.35rem] font-semibold leading-tight">One place to see what needs a response now.</h3>
            </div>

            <div className="grid gap-5 pt-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Focus queue</p>
                  <div className="mt-3 border-t border-border">
                    <div className="border-b border-border py-3">
                      <p className="text-sm font-medium text-foreground">{primaryTask.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{primaryClient.name} · {primaryTask.description}</p>
                    </div>
                    <div className="py-3 text-sm leading-6 text-muted-foreground">
                      Due {new Date(primaryTask.dueDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">Status summary</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Due today</p>
                      <p className="mt-1 text-2xl font-semibold">{dueToday.length}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tracked revenue</p>
                      <p className="mt-1 text-2xl font-semibold">$4.6k</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary/10 font-semibold text-primary">
                      {initials(primaryClient.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{primaryClient.name}</p>
                      <p className="text-sm text-muted-foreground">{primaryClient.company}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Notes, tags, and the next action stay attached to the relationship instead of getting buried.
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">Optional orders stay in view</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {primaryOrder.product} is visible in the same workspace without turning the product into heavy ops software.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-[18px] border border-border bg-card", className)}>
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-[linear-gradient(180deg,rgba(30,24,21,1),rgba(21,16,14,1))] px-5 py-6 text-white lg:border-b-0 lg:border-r">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Preview workspace</div>
          <div className="mt-6 space-y-2">
            {[
              ["Today", "Overview and focus queue"],
              ["Clients", "Relationships and next action"],
              ["Tasks", "Overdue, today, upcoming"],
              ["Orders", "Optional revenue view"],
            ].map(([label, detail], index) => (
              <button
                key={label}
                type="button"
                onClick={() => setTab(label.toLowerCase() as DemoTab)}
                className={cn(
                  "block w-full border-l px-3 py-2 text-left",
                  tab === label.toLowerCase() ? "border-primary text-white" : "border-white/10 text-white/68",
                )}
              >
                <div className="text-sm font-medium">{label}</div>
                <div className="mt-1 text-xs leading-5 text-white/52">{detail}</div>
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Open tasks</p>
              <p className="mt-1 text-2xl font-semibold">{openTasks.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Clients</p>
              <p className="mt-1 text-2xl font-semibold">{demoClients.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Tracked revenue</p>
              <p className="mt-1 text-2xl font-semibold">$4.6k</p>
            </div>
          </div>
        </aside>

        <div className="px-5 py-5 md:px-6 md:py-6">
          <div className="flex flex-wrap items-center gap-5 border-b border-border pb-4 text-sm">
            {[
              ["today", "Today"],
              ["clients", "Clients"],
              ["tasks", "Tasks"],
              ["orders", "Orders"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as DemoTab)}
                className={cn(
                  "border-b pb-2 font-medium transition-colors",
                  tab === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pt-5">
            {tab === "today" ? (
              <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
                <section>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Focus queue</p>
                    <p className="mt-1 text-sm text-muted-foreground">Start with the next client-moving action instead of hunting through separate tools.</p>
                  </div>
                  <div className="mt-4 border-t border-border">
                    {demoTasks.map((task) => {
                      const client = demoClients.find((item) => item.id === task.clientId)
                      return (
                        <div key={task.id} className="border-b border-border py-4 last:border-b-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{task.title}</p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">{client?.name} · {task.description}</p>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">{task.priority}</p>
                          </div>
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            {task.type} · {new Date(task.dueDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </section>

                <aside className="space-y-5 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Client in view</p>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary/10 font-semibold text-primary">
                        {initials(primaryClient.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{primaryClient.name}</p>
                        <p className="text-sm text-muted-foreground">{primaryClient.company}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      The relationship stays connected to open tasks, notes, and quick actions.
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold text-foreground">Today snapshot</p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Due today</p>
                        <p className="mt-1 text-2xl font-semibold">{dueToday.length}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Orders</p>
                        <p className="mt-1 text-2xl font-semibold">$4.6k</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold text-foreground">Why it stays light</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Orders remain optional, reminders stay attached to tasks, and the workspace avoids turning into a giant CRM schema.
                    </p>
                  </div>
                </aside>
              </div>
            ) : null}

            {tab === "clients" ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="border-t border-border">
                  {demoClients.map((client) => (
                    <div key={client.id} className="border-b border-border py-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary/10 font-semibold text-primary">
                          {initials(client.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-sm font-medium text-foreground">{client.name}</p>
                            <span className="text-xs text-muted-foreground">{client.status}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{client.company}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">Next action stays visible alongside notes, stage, and recent touchpoints.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="space-y-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <p className="text-sm font-semibold text-foreground">Selected relationship</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Open one client and keep contact details, context, task history, and linked orders in the same view.
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{primaryClient.tags.join(" · ")}</p>
                  </div>
                </aside>
              </div>
            ) : null}

            {tab === "tasks" ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="border-t border-border">
                  {demoTasks.map((task) => (
                    <div key={task.id} className="border-b border-border py-4 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{task.description}</p>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">{task.priority}</p>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {task.type} · {new Date(task.dueDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>

                <aside className="space-y-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <p className="text-sm font-semibold text-foreground">Task detail</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Due date, linked client, note, and quick status actions all stay compact so the task is easy to complete.
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reminder mode</p>
                    <p className="mt-2 text-sm text-muted-foreground">App reminder with optional email follow-up.</p>
                  </div>
                </aside>
              </div>
            ) : null}

            {tab === "orders" ? (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="border-t border-border">
                  {demoOrders.map((order) => (
                    <div key={order.id} className="border-b border-border py-4 last:border-b-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{order.product}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{order.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">${order.amount.toLocaleString()}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="space-y-4 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    Optional order tracking
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Keep scope, value, status, and linked client visible without turning the workspace into project management software.
                  </p>
                </aside>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-primary" />
            Sample data only. No signup and no live client records.
          </div>
        </div>
      </div>
    </div>
  )
}
