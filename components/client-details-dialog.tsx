"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, Building, Calendar, FileText, Tag, MessageSquare, Plus } from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import { useOrders } from "@/hooks/use-orders"
import { useSettings } from "@/hooks/use-settings"
import type { Client, Interaction } from "@/types/client"

interface ClientDetailsDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  const { updateClient } = useClients()
  const { getClientOrders } = useOrders()
  const { settings } = useSettings()
  const [newNote, setNewNote] = useState("")

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
        return "bg-purple-100 text-purple-800"
      case "lead":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addInteraction = () => {
    if (!newNote.trim()) return

    const newInteraction: Interaction = {
      id: Date.now().toString(),
      type: "note",
      content: newNote.trim(),
      date: new Date().toISOString(),
    }

    const updatedInteractions = [newInteraction, ...(client.interactions || [])]
    updateClient(client.id, {
      interactions: updatedInteractions,
      lastContact: new Date().toISOString(),
    })
    setNewNote("")
  }

  const clientOrders = settings.orderTrackingEnabled ? getClientOrders(client.id) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {client.name} - Client Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              {client.company && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Building className="h-4 w-4" />
                  {client.company}
                </p>
              )}
            </div>
            <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              {settings.orderTrackingEnabled && <TabsTrigger value="orders">Orders</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last contact: {formatDate(client.lastContact)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags assigned</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {client.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="interactions" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Add New Interaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Log a conversation, meeting, or note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={addInteraction} disabled={!newNote.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interaction
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Interaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {client.interactions && client.interactions.length > 0 ? (
                    <div className="space-y-4">
                      {client.interactions.map((interaction) => (
                        <div key={interaction.id} className="border-l-2 border-muted pl-4 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium capitalize">{interaction.type}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(interaction.date)}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{interaction.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No interactions recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {settings.orderTrackingEnabled && (
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clientOrders.length > 0 ? (
                      <div className="space-y-3">
                        {clientOrders.map((order) => (
                          <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <div className="font-medium">{order.product}</div>
                              <div className="text-sm text-muted-foreground">{formatDate(order.date)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${order.amount.toFixed(2)}</div>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No orders recorded yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
