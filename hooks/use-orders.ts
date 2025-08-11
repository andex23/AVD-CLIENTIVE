"use client"

import * as React from "react"
import type { Order } from "@/types/order"
import { apiFetch } from "@/lib/api-client"
import { safeDate } from "@/lib/date"

type OrdersContextValue = {
  orders: Order[]
  inactiveClients: string[]
  addOrder: (orderData: Omit<Order, "id">) => Promise<void>
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  getClientOrders: (clientId: string) => Order[]
  getClientLastOrder: (clientId: string) => Order | null
  getClientOrderCount: (clientId: string) => number
}

const OrdersContext = React.createContext<OrdersContextValue | null>(null)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState<Order[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const { orders } = await apiFetch<{ orders: Order[] }>("/api/orders")
      setOrders(orders)
      } catch (e) {
        console.warn("Orders load failed; starting empty until auth is configured.", e)
        setOrders([])
      }
    }
    load()
  }, [])

  const addOrder = React.useCallback(async (orderData: Omit<Order, "id">) => {
    try {
      const { order } = await apiFetch<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      })
      setOrders((prev) => [order, ...prev])
    } catch (e) {
      console.error("Failed to add order:", e)
    }
  }, [])

  const updateOrder = React.useCallback(async (id: string, updates: Partial<Order>) => {
    try {
      const { order } = await apiFetch<{ order: Order }>(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      })
      setOrders((prev) => prev.map((o) => (o.id === id ? order : o)))
    } catch (e) {
      console.error("Failed to update order:", e)
    }
  }, [])

  const deleteOrder = React.useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/orders/${id}`, { method: "DELETE" })
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } catch (e) {
      console.error("Failed to delete order:", e)
    }
  }, [])

  const getClientOrders = React.useCallback((clientId: string) => {
    return [...orders]
      .filter((o) => o.clientId === clientId)
      .sort((a, b) => (safeDate(b.date)?.getTime() ?? 0) - (safeDate(a.date)?.getTime() ?? 0))
  }, [orders])

  const getClientLastOrder = React.useCallback((clientId: string) => {
    const list = orders.filter((o) => o.clientId === clientId)
    if (list.length === 0) return null
    return list.sort((a, b) => (safeDate(b.date)?.getTime() ?? 0) - (safeDate(a.date)?.getTime() ?? 0))[0]
  }, [orders])

  const getClientOrderCount = React.useCallback((clientId: string) => {
    return orders.filter((o) => o.clientId === clientId).length
  }, [orders])

  const inactiveClients = React.useMemo(() => {
    const thirty = new Date()
    thirty.setDate(thirty.getDate() - 30)
    const withOrders = new Set(orders.map((o) => o.clientId))
    const withRecent = new Set(orders.filter((o) => {
      const d = safeDate(o.date)
      return !!d && d >= thirty
    }).map((o) => o.clientId))
    return Array.from(withOrders).filter((id) => !withRecent.has(id))
  }, [orders])

  return (
    <OrdersContext.Provider
      value={{ orders, inactiveClients, addOrder, updateOrder, deleteOrder, getClientOrders, getClientLastOrder, getClientOrderCount }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext)
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider")
  return ctx
}
