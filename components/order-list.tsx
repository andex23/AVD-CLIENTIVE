"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronRight, DollarSign, MoreHorizontal, Package2, UserCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteOrderDialog } from "@/components/delete-order-dialog"
import { EditOrderDialog } from "@/components/edit-order-dialog"
import { useTasks } from "@/hooks/use-tasks"
import { formatDateShort, safeDate } from "@/lib/date"
import { getOrderStatusTone } from "@/lib/workspace-ui"
import type { Client } from "@/types/client"
import type { Order } from "@/types/order"

interface OrderListProps {
  orders: Order[]
  clients: Client[]
}

export function OrderList({ orders, clients }: OrderListProps) {
  const { tasks } = useTasks()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => (safeDate(b.date)?.getTime() ?? 0) - (safeDate(a.date)?.getTime() ?? 0)),
    [orders],
  )

  useEffect(() => {
    if (!selectedOrderId || !sortedOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(sortedOrders[0]?.id ?? null)
    }
  }, [selectedOrderId, sortedOrders])

  const selectedOrder = sortedOrders.find((order) => order.id === selectedOrderId) ?? sortedOrders[0] ?? null
  const selectedClient = clients.find((client) => client.id === selectedOrder?.clientId) ?? null
  const relatedTasks = selectedOrder
    ? tasks
        .filter((task) => task.clientId === selectedOrder.clientId && !task.completed)
        .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0))
        .slice(0, 3)
    : []

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-border p-6">
        <div className="flex flex-col items-start gap-4">
          <div className="card-passive grid h-11 w-11 place-items-center text-muted-foreground">
            <Package2 className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans text-lg font-semibold text-foreground">No orders yet</h3>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Enable order tracking only when you need a cleaner business pulse. When it is on, CLIENTIVE keeps it lean.
            </p>
          </div>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-add-order"))
              }
            }}
          >
            Add order
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden border-t border-border">
          <div className="border-b border-border px-5 py-4">
            <p className="ui-kicker">Order ledger</p>
            <h2 className="mt-1 font-sans text-lg font-semibold text-foreground">Lean visibility into revenue-moving work</h2>
          </div>
          <div className="p-2">
            {sortedOrders.map((order) => {
              const client = clients.find((item) => item.id === order.clientId)
              const isSelected = selectedOrder?.id === order.id
              return (
                <div key={order.id} className={`${isSelected ? "bg-[hsl(var(--surface-soft))/0.28]" : "bg-transparent"} border-b border-border/80 last:border-b-0`}>
                  <div className="flex items-start gap-3 px-3 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="grid flex-1 gap-3 text-left lg:grid-cols-[minmax(0,1fr)_0.8fr_0.6fr_auto]"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{order.product}</p>
                        <p className="ui-meta">{client?.name || "Unknown client"} · {order.description || "No scope summary added."}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">${order.amount.toFixed(2)}</p>
                        <p className="ui-meta">{formatDateShort(order.date)}</p>
                      </div>
                      <div className="space-y-1">
                        <Badge className={getOrderStatusTone(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="flex justify-start lg:justify-end">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingOrder(order)}>Edit order</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-destructive">
                          Delete order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="ui-kicker">Selected order</p>
                    <h3 className="mt-1 font-sans text-xl font-semibold text-foreground">{selectedOrder.product}</h3>
                  </div>
                  <Badge className={getOrderStatusTone(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {selectedOrder.description || "Use this space as a compact scope summary rather than a full project record."}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="border-t border-border pt-3">
                  <p className="ui-kicker">Value</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <DollarSign className="h-4 w-4 text-primary" />
                    {selectedOrder.amount.toFixed(2)}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="ui-kicker">Timeline</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{formatDateShort(selectedOrder.date)}</p>
                  <p className="ui-meta mt-1">Tracked from the date the work or sale was recorded.</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="ui-kicker">Linked client</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    {selectedClient?.name || "Unknown client"}
                  </p>
                  <p className="ui-meta mt-1">{selectedClient?.company || selectedClient?.email || "No client details available."}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="ui-kicker">Related tasks</p>
                {relatedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {relatedTasks.map((task) => (
                      <div key={task.id} className="border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="ui-meta mt-1">{formatDateShort(task.dueDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    No active tasks are linked to this client right now. Keep orders lean and attach follow-ups only when they matter.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {editingOrder ? (
        <EditOrderDialog order={editingOrder} clients={clients} open={!!editingOrder} onOpenChange={() => setEditingOrder(null)} />
      ) : null}
      {deletingOrder ? (
        <DeleteOrderDialog order={deletingOrder} open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)} />
      ) : null}
    </>
  )
}
