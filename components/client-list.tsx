"use client"

import { useState, useMemo } from "react"
import {
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Trash2,
  FileText,
  MessageCircle,
  ShoppingCart,
  X,
  FilterIcon,
  SortAsc,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { EditClientDialog } from "@/components/edit-client-dialog"
import { DeleteClientDialog } from "@/components/delete-client-dialog"
import { ClientDetailsDialog } from "@/components/client-details-dialog"
import { QuickActionsDialog } from "@/components/quick-actions-dialog"
import { useOrders } from "@/hooks/use-orders"
import { useClients } from "@/hooks/use-clients"
import type { Client } from "@/types/client"

interface ClientListProps {
  clients: Client[]
  orderTrackingEnabled: boolean
}

type SortKey = "name" | "lastContact"

export function ClientList({ clients, orderTrackingEnabled }: ClientListProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [quickActionsClient, setQuickActionsClient] = useState<Client | null>(null)

  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [tagDraft, setTagDraft] = useState<Record<string, string>>({})
  const [tagFilter, setTagFilter] = useState<string>("all")

  const { updateClient } = useClients()
  const { getClientLastOrder, getClientOrderCount } = useOrders()

  const uniqueTags = useMemo(() => {
    const all = new Set<string>()
    clients.forEach((c) => c.tags.forEach((t) => t && all.add(t)))
    return Array.from(all)
  }, [clients])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "prospect":
        return "bg-blue-100 text-blue-800"
      case "vip":
        // Brand orange accent for VIP
        return "bg-orange-100 text-orange-800"
      case "lead":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleQuickAction = (client: Client, action: string) => {
    switch (action) {
      case "whatsapp":
        if (!client.phone) return
        const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, "")}?text=Hi ${client.name}, `
        window.open(whatsappUrl, "_blank")
        break
      case "call":
        if (!client.phone) return
        window.open(`tel:${client.phone}`, "_self")
        break
      case "email":
        window.open(`mailto:${client.email}?subject=Follow up&body=Hi ${client.name},%0D%0A%0D%0A`, "_self")
        break
    }
  }

  const addTag = (client: Client) => {
    const draft = (tagDraft[client.id] || "").trim()
    if (!draft) return
    if (client.tags.includes(draft)) {
      setTagDraft((prev) => ({ ...prev, [client.id]: "" }))
      return
    }
    updateClient(client.id, { tags: [...client.tags, draft] })
    setTagDraft((prev) => ({ ...prev, [client.id]: "" }))
  }

  const removeTag = (client: Client, tagToRemove: string) => {
    updateClient(client.id, { tags: client.tags.filter((t) => t !== tagToRemove) })
  }

  const filteredAndSorted = useMemo(() => {
    let list = clients
    if (tagFilter !== "all") {
      const lf = tagFilter.toLowerCase()
      list = list.filter((c) => c.tags.some((t) => t.toLowerCase() === lf))
    }
    if (sortKey === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else {
      list = [...list].sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime())
    }
    return list
  }, [clients, sortKey, tagFilter])

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground text-center">Get started by adding your first client to the system.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Clients ({filteredAndSorted.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {uniqueTags.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-muted-foreground" />
                <Select value={sortKey} onValueChange={(v: any) => setSortKey(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="lastContact">Last Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contact</TableHead>
                {orderTrackingEnabled && <TableHead>Orders</TableHead>}
                <TableHead>Quick Actions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.map((client) => {
                const lastOrder = orderTrackingEnabled ? getClientLastOrder(client.id) : null
                const orderCount = orderTrackingEnabled ? getClientOrderCount(client.id) : 0

                return (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {/* Inline tags with add/remove */}
                          <div className="mt-1 space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {client.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                  {tag}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => removeTag(client, tag)}
                                    aria-label={`Remove tag ${tag}`}
                                  />
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={tagDraft[client.id] || ""}
                                onChange={(e) => setTagDraft((prev) => ({ ...prev, [client.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    addTag(client)
                                  }
                                }}
                                placeholder="Add tag"
                                className="h-8 w-[160px]"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 bg-transparent"
                                onClick={() => addTag(client)}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{client.company || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Inline editable status */}
                      <Select
                        value={client.status}
                        onValueChange={(value: any) => updateClient(client.id, { status: value })}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(client.lastContact)}</span>
                      </div>
                    </TableCell>
                    {orderTrackingEnabled && (
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                            <span>{orderCount} orders</span>
                          </div>
                          {lastOrder && (
                            <div className="text-xs text-muted-foreground">Last: {formatDate(lastOrder.date)}</div>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-1">
                        {client.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickAction(client, "whatsapp")}
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {client.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickAction(client, "call")}
                            title="Call"
                          >
                            <Phone className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickAction(client, "email")}
                          title="Email"
                        >
                          <Mail className="h-4 w-4 text-orange-600" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingClient(client)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingClient(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingClient(client)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingClient && (
        <EditClientDialog client={editingClient} open={!!editingClient} onOpenChange={() => setEditingClient(null)} />
      )}

      {deletingClient && (
        <DeleteClientDialog
          client={deletingClient}
          open={!!deletingClient}
          onOpenChange={() => setDeletingClient(null)}
        />
      )}

      {viewingClient && (
        <ClientDetailsDialog
          client={viewingClient}
          open={!!viewingClient}
          onOpenChange={() => setViewingClient(null)}
        />
      )}

      {quickActionsClient && (
        <QuickActionsDialog
          client={quickActionsClient}
          open={!!quickActionsClient}
          onOpenChange={() => setQuickActionsClient(null)}
        />
      )}
    </>
  )
}
