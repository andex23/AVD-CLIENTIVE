"use client"

import { useMemo, useState } from "react"
import { Building2, CalendarClock, Mail, MessageSquare, Phone, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useClients } from "@/hooks/use-clients"
import { useOrders } from "@/hooks/use-orders"
import { useSettings } from "@/hooks/use-settings"
import { useTasks } from "@/hooks/use-tasks"
import { formatDateShort, safeDate, timeAgo } from "@/lib/date"
import { formatEnumLabel, getClientStageTone } from "@/lib/workspace-ui"
import type { Client, Interaction } from "@/types/client"

interface ClientDetailsDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  const { clients, updateClient } = useClients()
  const { getClientOrders } = useOrders()
  const { settings } = useSettings()
  const { tasks } = useTasks()
  const [newNote, setNewNote] = useState("")
  const currentClient = clients.find((entry) => entry.id === client.id) || client

  const linkedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.clientId === currentClient.id)
        .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0)),
    [currentClient.id, tasks],
  )
  const clientOrders = settings.orderTrackingEnabled ? getClientOrders(currentClient.id) : []

  const addInteraction = async () => {
    if (!newNote.trim()) return

    const interaction: Interaction = {
      id: Date.now().toString(),
      type: "note",
      content: newNote.trim(),
      date: new Date().toISOString(),
    }

    await updateClient(currentClient.id, {
      interactions: [interaction, ...(currentClient.interactions || [])],
      lastContact: new Date().toISOString(),
    })

    setNewNote("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-[hsl(var(--surface-ivory))] sm:max-w-[980px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-sans text-2xl">Relationship record</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="card-primary p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-sans text-2xl font-semibold text-foreground">{currentClient.name}</h2>
                    <Badge className={getClientStageTone(currentClient.status)}>{formatEnumLabel(currentClient.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentClient.company || "Independent relationship"} · Last contact {timeAgo(currentClient.lastContact)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${currentClient.email}`, "_self")}>
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  {currentClient.phone ? (
                    <Button size="sm" variant="outline" onClick={() => window.open(`tel:${currentClient.phone}`, "_self")}>
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="card-secondary p-5">
              <p className="ui-kicker">Summary / notes</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {currentClient.notes || "No summary note yet. Keep a short line here on tone, scope, or what matters before the next touchpoint."}
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="card-secondary p-5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <p className="ui-kicker">Open tasks</p>
                </div>
                <div className="mt-4 space-y-3">
                  {linkedTasks.filter((task) => !task.completed).slice(0, 4).map((task) => (
                    <div key={task.id} className="card-passive p-3">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="ui-meta mt-1">
                        {formatEnumLabel(task.type)} · {formatDateShort(task.dueDate)}
                      </p>
                    </div>
                  ))}
                  {linkedTasks.filter((task) => !task.completed).length === 0 ? (
                    <p className="text-sm leading-6 text-muted-foreground">No open tasks are attached yet.</p>
                  ) : null}
                </div>
              </div>

              <div className="card-secondary p-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <p className="ui-kicker">Recent touchpoints</p>
                </div>
                <div className="mt-4 space-y-3">
                  {(currentClient.interactions || []).slice(0, 5).map((interaction) => (
                    <div key={interaction.id} className="card-passive p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{formatEnumLabel(interaction.type)}</p>
                        <span className="ui-meta">{timeAgo(interaction.date)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{interaction.content}</p>
                    </div>
                  ))}
                  {(currentClient.interactions || []).length === 0 ? (
                    <p className="text-sm leading-6 text-muted-foreground">No touchpoints have been logged yet.</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="card-secondary p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="ui-kicker">Recent activity</p>
                  <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Log a note while the context is fresh</h3>
                </div>
                <Button size="sm" onClick={addInteraction} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                  Add note
                </Button>
              </div>
              <Textarea
                className="mt-4"
                placeholder="Conversation summary, commitment made, or what to pick up next time."
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
              />
            </section>
          </div>

          <aside className="card-secondary h-fit p-5">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="ui-kicker">Contact details</p>
                <div className="space-y-2 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{currentClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{currentClient.phone || "Not added yet"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{currentClient.company || "No business context added"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="ui-kicker">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {currentClient.tags.length > 0 ? (
                    currentClient.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-border/80 bg-background/85">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="ui-meta">No tags yet</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="ui-kicker">Linked orders</p>
                {clientOrders.length > 0 ? (
                  <div className="space-y-2">
                    {clientOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="card-passive p-3">
                        <p className="text-sm font-medium text-foreground">{order.product}</p>
                        <p className="ui-meta mt-1">
                          ${order.amount.toFixed(0)} · {formatDateShort(order.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">No linked orders yet.</p>
                )}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="ui-kicker">Next planned action</p>
                {linkedTasks.find((task) => !task.completed) ? (
                  <div className="card-passive p-3">
                    <p className="text-sm font-medium text-foreground">{linkedTasks.find((task) => !task.completed)?.title}</p>
                    <p className="ui-meta mt-1">{formatDateShort(linkedTasks.find((task) => !task.completed)?.dueDate)}</p>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">Plan the next follow-up so the relationship stays warm.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
