"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  CalendarClock,
  Mail,
  MessageCircle,
  MoreHorizontal,
  NotebookText,
  Package2,
  Phone,
  Search,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ClientDetailsDialog } from "@/components/client-details-dialog"
import { DeleteClientDialog } from "@/components/delete-client-dialog"
import { EditClientDialog } from "@/components/edit-client-dialog"
import { useOrders } from "@/hooks/use-orders"
import { useTasks } from "@/hooks/use-tasks"
import { formatDateShort, isOverdue, safeDate, timeAgo } from "@/lib/date"
import { cn } from "@/lib/utils"
import { formatEnumLabel, getClientAttentionState, getClientStageTone, getInitials } from "@/lib/workspace-ui"
import type { Client } from "@/types/client"

interface ClientListProps {
  clients: Client[]
  orderTrackingEnabled: boolean
}

type ClientFilter = "all" | "active" | "warm" | "overdue" | "archived"

const FILTERS: Array<{ key: ClientFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "warm", label: "Warm" },
  { key: "overdue", label: "Overdue" },
  { key: "archived", label: "Archived" },
]

function openWhatsApp(client: Client) {
  if (!client.phone) return
  window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=Hi ${client.name}, `, "_blank", "noopener,noreferrer")
}

function callClient(client: Client) {
  if (!client.phone) return
  window.open(`tel:${client.phone}`, "_self")
}

function emailClient(client: Client) {
  window.open(`mailto:${client.email}?subject=Follow up&body=Hi ${client.name},%0D%0A%0D%0A`, "_self")
}

export function ClientList({ clients, orderTrackingEnabled }: ClientListProps) {
  const { tasks } = useTasks()
  const { getClientOrders } = useOrders()
  const [searchValue, setSearchValue] = useState("")
  const [activeFilter, setActiveFilter] = useState<ClientFilter>("all")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id ?? null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)

  const nextTaskByClient = useMemo(() => {
    const entries = new Map<string, (typeof tasks)[number]>()
    for (const task of tasks
      .filter((item) => !item.completed)
      .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0))) {
      if (!entries.has(task.clientId)) entries.set(task.clientId, task)
    }
    return entries
  }, [tasks])

  const visibleClients = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return clients
      .filter((client) => {
        if (activeFilter === "active") return client.status === "active" || client.status === "vip"
        if (activeFilter === "warm") return client.status === "lead" || client.status === "prospect"
        if (activeFilter === "archived") return client.status === "inactive"
        if (activeFilter === "overdue") {
          const attention = getClientAttentionState(client, tasks)
          return attention.label === "Needs touch" || attention.label === "Follow-up overdue"
        }
        return true
      })
      .filter((client) => {
        if (!query) return true
        return (
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.company || "").toLowerCase().includes(query) ||
          client.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      })
      .sort((a, b) => {
        const aTask = nextTaskByClient.get(a.id)
        const bTask = nextTaskByClient.get(b.id)
        const aUrgent = aTask ? Number(isOverdue(aTask.dueDate, aTask.completed)) : 0
        const bUrgent = bTask ? Number(isOverdue(bTask.dueDate, bTask.completed)) : 0
        if (aUrgent !== bUrgent) return bUrgent - aUrgent
        return (safeDate(a.lastContact)?.getTime() ?? 0) - (safeDate(b.lastContact)?.getTime() ?? 0)
      })
  }, [activeFilter, clients, nextTaskByClient, searchValue, tasks])

  useEffect(() => {
    if (visibleClients.length === 0) {
      setSelectedClientId(null)
      return
    }

    if (!selectedClientId || !visibleClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(visibleClients[0].id)
    }
  }, [selectedClientId, visibleClients])

  const selectedClient = visibleClients.find((client) => client.id === selectedClientId) ?? visibleClients[0] ?? null
  const selectedClientTasks = useMemo(
    () =>
      selectedClient
        ? tasks
            .filter((task) => task.clientId === selectedClient.id)
            .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0))
        : [],
    [selectedClient, tasks],
  )
  const selectedClientOrders = selectedClient ? getClientOrders(selectedClient.id).slice(0, 4) : []
  const attentionCount = visibleClients.filter((client) => {
    const state = getClientAttentionState(client, tasks)
    return state.label === "Follow-up overdue" || state.label === "Needs touch"
  }).length

  if (clients.length === 0) {
    return (
      <div className="border border-dashed border-border p-6">
        <div className="flex flex-col items-start gap-4">
          <div className="card-passive grid h-11 w-11 place-items-center text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans text-lg font-semibold text-foreground">No clients yet</h3>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Start with a single relationship record. CLIENTIVE will keep context, touchpoints, and next actions in
              one place from there.
            </p>
          </div>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-add-client"))
              }
            }}
          >
            New client
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden border-t border-border">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="ui-kicker">Relationship center</p>
                <h2 className="font-sans text-lg font-semibold text-foreground">Active client book</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{visibleClients.length} visible</span>
                <span>{attentionCount} need attention</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search names, company, context, or tags"
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      "rounded-[10px] border px-3 py-2 text-xs font-medium transition-colors",
                      activeFilter === filter.key
                        ? "border-foreground/10 bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2">
            {visibleClients.length > 0 ? (
              visibleClients.map((client) => {
                const nextTask = nextTaskByClient.get(client.id)
                const attention = getClientAttentionState(client, tasks)
                const isSelected = selectedClient?.id === client.id

                return (
                  <div
                    key={client.id}
                    className={cn(
                      "border-b border-border/80 transition-colors last:border-b-0",
                      isSelected ? "bg-[hsl(var(--surface-soft))/0.3]" : "bg-transparent",
                    )}
                  >
                    <div className="flex items-start gap-3 px-3 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className="grid flex-1 gap-3 text-left lg:grid-cols-[minmax(0,1.2fr)_0.72fr_0.9fr_auto]"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-sm font-semibold text-primary">
                              {getInitials(client.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{client.name}</p>
                              <p className="ui-meta truncate">{client.company || client.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {client.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="border-border/80 bg-background/85 text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                            {client.tags.length > 2 ? (
                              <span className="ui-meta rounded-full border border-border/80 px-2.5 py-1">+{client.tags.length - 2}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Badge className={getClientStageTone(client.status)}>{formatEnumLabel(client.status)}</Badge>
                          <p className="ui-meta">Last contact {timeAgo(client.lastContact)}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{nextTask ? nextTask.title : "Plan next touch"}</p>
                          <p className="ui-meta">
                            {nextTask ? `${formatDateShort(nextTask.dueDate)} · ${formatEnumLabel(nextTask.type)}` : "No follow-up is scheduled yet."}
                          </p>
                        </div>

                        <div className="flex justify-start lg:justify-end">
                          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", attention.tone)}>{attention.label}</span>
                        </div>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingClient(client)}>Open relationship record</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingClient(client)}>Edit client</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingClient(client)} className="text-destructive">
                            Delete client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="border border-dashed border-border p-6">
                <h3 className="font-sans text-base font-semibold text-foreground">No clients match that search</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Adjust the filters or clear the query. CLIENTIVE keeps relationship visibility in one list so you do
                  not have to bounce between views.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          {selectedClient ? (
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="ui-kicker">Selected client</p>
                    <h3 className="mt-1 font-sans text-xl font-semibold text-foreground">{selectedClient.name}</h3>
                    <p className="ui-meta mt-1">{selectedClient.company || selectedClient.email}</p>
                  </div>
                  <Badge className={getClientStageTone(selectedClient.status)}>{formatEnumLabel(selectedClient.status)}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedClient.phone ? (
                    <Button size="sm" onClick={() => openWhatsApp(selectedClient)}>
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => emailClient(selectedClient)}>
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  {selectedClient.phone ? (
                    <Button size="sm" variant="outline" onClick={() => callClient(selectedClient)}>
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-5 border-t border-border pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      {selectedClientTasks.find((task) => !task.completed)?.title || "No follow-up planned yet"}
                    </p>
                  </div>
                  <p className="ui-meta">
                    {selectedClientTasks.find((task) => !task.completed)
                      ? `Next action on ${formatDateShort(selectedClientTasks.find((task) => !task.completed)?.dueDate)}`
                      : "Add the next task so this relationship never goes cold."}
                  </p>
                </div>

                <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <p className="ui-kicker">Contact</p>
                    <div className="mt-2 space-y-1.5 text-sm text-foreground">
                      <p>{selectedClient.email}</p>
                      <p>{selectedClient.phone || "Phone not added"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="ui-kicker">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedClient.tags.length > 0 ? (
                        selectedClient.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="border-border/80 bg-background/80">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="ui-meta">No tags yet</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <p className="ui-kicker">Relationship notes</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedClient.notes || "Keep a short working note here so the next touchpoint starts with context."}
                  </p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="ui-kicker">Open tasks</p>
                    <span className="ui-meta">{selectedClientTasks.filter((task) => !task.completed).length} active</span>
                  </div>
                  <div className="space-y-2">
                    {selectedClientTasks.filter((task) => !task.completed).slice(0, 3).map((task) => (
                      <div key={task.id} className="border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="ui-meta mt-1">
                          {formatEnumLabel(task.type)} · {formatDateShort(task.dueDate)}
                        </p>
                      </div>
                    ))}
                    {selectedClientTasks.filter((task) => !task.completed).length === 0 ? (
                      <p className="ui-meta">No open tasks are linked yet.</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <p className="ui-kicker">Recent touchpoints</p>
                  <div className="space-y-2">
                    {(selectedClient.interactions || []).slice(0, 3).map((interaction) => (
                      <div key={interaction.id} className="border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
                        <p className="text-sm font-medium text-foreground">{formatEnumLabel(interaction.type)}</p>
                        <p className="ui-meta mt-1">{timeAgo(interaction.date)}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{interaction.content}</p>
                      </div>
                    ))}
                    {(selectedClient.interactions || []).length === 0 ? (
                      <p className="ui-meta">No touchpoints logged yet. Add the first note when you next reach out.</p>
                    ) : null}
                  </div>
                </div>

                {orderTrackingEnabled ? (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-primary" />
                      <p className="ui-kicker">Linked orders</p>
                    </div>
                    <div className="space-y-2">
                      {selectedClientOrders.length > 0 ? (
                        selectedClientOrders.map((order) => (
                          <div key={order.id} className="border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
                            <p className="text-sm font-medium text-foreground">{order.product}</p>
                            <p className="ui-meta mt-1">
                              ${order.amount.toFixed(0)} · {formatDateShort(order.date)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="ui-meta">No order history is attached to this client yet.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <Button variant="outline" className="w-full" onClick={() => setViewingClient(selectedClient)}>
                <NotebookText className="h-4 w-4" />
                Open full relationship record
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="ui-kicker">Client detail</p>
              <h3 className="font-sans text-base font-semibold text-foreground">Select a relationship</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Pick a client from the list to see notes, next actions, touchpoints, and linked orders in one place.
              </p>
            </div>
          )}
        </aside>
      </div>

      {viewingClient ? (
        <ClientDetailsDialog client={viewingClient} open={!!viewingClient} onOpenChange={() => setViewingClient(null)} />
      ) : null}
      {editingClient ? (
        <EditClientDialog client={editingClient} open={!!editingClient} onOpenChange={() => setEditingClient(null)} />
      ) : null}
      {deletingClient ? (
        <DeleteClientDialog client={deletingClient} open={!!deletingClient} onOpenChange={() => setDeletingClient(null)} />
      ) : null}
    </>
  )
}
