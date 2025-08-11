"use client"

import * as React from "react"
import type { Client } from "@/types/client"
import type { FilterOptions } from "@/components/filter-dialog"
import { apiFetch } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

type ClientsContextValue = {
  clients: Client[]
  filteredClients: Client[]
  recentClients: Client[]
  addClient: (clientData: Omit<Client, "id">) => Promise<void>
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  searchClients: (query: string) => void
  filterClients: (filters: FilterOptions) => void
}

const ClientsContext = React.createContext<ClientsContextValue | null>(null)

const STORAGE_KEY = "crm:clients"

const localSample: Client[] = [
  {
    id: "sample-1",
    name: "Sample Client",
    email: "sample@example.com",
    status: "prospect",
    lastContact: new Date().toISOString(),
    tags: ["example"],
    interactions: [],
  },
]

function loadLocal(): Client[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!raw) return localSample
    const parsed = JSON.parse(raw) as Client[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : localSample
  } catch {
    return localSample
  }
}

function saveLocal(clients: Client[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  } catch {
    // ignore
  }
}

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = React.useState<Client[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filters, setFilters] = React.useState<FilterOptions>({})
  const { toast } = useToast()

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<{ clients: Client[] }>("/api/clients")
        setClients(data.clients)
        saveLocal(data.clients)
      } catch (e) {
        const fallback = loadLocal()
        setClients(fallback)
        console.warn("Clients load failed; using local data.", e)
        toast({
          title: "Offline/Preview Mode",
          description: "Using local client data. Connect Supabase or sign in to sync.",
        })
      }
    }
    load()
  }, [toast])

  const addClient = React.useCallback(
    async (clientData: Omit<Client, "id">) => {
      try {
        const data = await apiFetch<{ client: Client }>("/api/clients", {
          method: "POST",
          body: JSON.stringify(clientData),
        })
        setClients((prev) => {
          const next = [data.client, ...prev]
          saveLocal(next)
          return next
        })
        toast({ title: "Client added", description: `${clientData.name} was added successfully.` })
      } catch (e: any) {
        // Preview/local fallback
        const local: Client = { ...clientData, id: `local-${Date.now()}` }
        setClients((prev) => {
          const next = [local, ...prev]
          saveLocal(next)
          return next
        })
        console.error("Failed to add client (saved locally):", e)
        toast({
          title: "Saved locally",
          description: "We couldn't reach the server. The client was saved locally for now.",
        })
      }
    },
    [toast],
  )

  const updateClient = React.useCallback(
    async (id: string, updates: Partial<Client>) => {
      try {
        const data = await apiFetch<{ client: Client }>(`/api/clients/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
        })
        setClients((prev) => {
          const next = prev.map((c) => (c.id === id ? data.client : c))
          saveLocal(next)
          return next
        })
        toast({ title: "Client updated" })
      } catch (e: any) {
        // Local fallback update
        setClients((prev) => {
          const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
          saveLocal(next)
          return next
        })
        console.error("Failed to update client (updated locally):", e)
        toast({
          title: "Updated locally",
          description: "We couldn't reach the server. Changes were saved locally.",
        })
      }
    },
    [toast],
  )

  const deleteClient = React.useCallback(
    async (id: string) => {
      try {
        await apiFetch(`/api/clients/${id}`, { method: "DELETE" })
        setClients((prev) => {
          const next = prev.filter((c) => c.id !== id)
          saveLocal(next)
          return next
        })
        toast({ title: "Client deleted" })
      } catch (e: any) {
        // Local fallback delete
        setClients((prev) => {
          const next = prev.filter((c) => c.id !== id)
          saveLocal(next)
          return next
        })
        console.error("Failed to delete client (deleted locally):", e)
        toast({
          title: "Deleted locally",
          description: "We couldn't reach the server. The client was removed locally.",
        })
      }
    },
    [toast],
  )

  const searchClients = React.useCallback((q: string) => setSearchQuery(q), [])
  const filterClients = React.useCallback((f: FilterOptions) => setFilters(f), [])

  const filteredClients = React.useMemo(() => {
    let result = clients

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(q) ||
          client.email.toLowerCase().includes(q) ||
          (client.company && client.company.toLowerCase().includes(q)) ||
          client.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (filters.status) result = result.filter((c) => c.status === filters.status)
    if (filters.lastContactDays) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - filters.lastContactDays)
      result = result.filter((c) => new Date(c.lastContact) >= cutoff)
    }
    if (filters.tag) {
      const tq = filters.tag.toLowerCase()
      result = result.filter((c) => c.tags.some((t) => t.toLowerCase().includes(tq)))
    }
    return result
  }, [clients, searchQuery, filters])

  const recentClients = React.useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return clients.filter((c) => new Date(c.lastContact) >= weekAgo)
  }, [clients])

  return (
    <ClientsContext.Provider
      value={{
        clients,
        filteredClients,
        recentClients,
        addClient,
        updateClient,
        deleteClient,
        searchClients,
        filterClients,
      }}
    >
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  const ctx = React.useContext(ClientsContext)
  if (!ctx) throw new Error("useClients must be used within a ClientsProvider")
  return ctx
}
