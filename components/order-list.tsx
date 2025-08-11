"use client"

import { useState } from "react"
import { MoreHorizontal, Calendar, DollarSign, Package, User, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditOrderDialog } from "@/components/edit-order-dialog"
import { DeleteOrderDialog } from "@/components/delete-order-dialog"
import type { Order } from "@/types/order"
import type { Client } from "@/types/client"

interface OrderListProps {
  orders: Order[]
  clients: Client[]
}

export function OrderList({ orders, clients }: OrderListProps) {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "Unknown Client"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start tracking orders to monitor customer purchase activity.
          </p>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-add-order"))
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Order
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {order.product}
                      </div>
                      {order.description && (
                        <div className="text-sm text-muted-foreground mt-1">{order.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{getClientName(order.clientId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(order.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${order.amount.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingOrder(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingOrder && (
        <EditOrderDialog
          order={editingOrder}
          clients={clients}
          open={!!editingOrder}
          onOpenChange={() => setEditingOrder(null)}
        />
      )}

      {deletingOrder && (
        <DeleteOrderDialog order={deletingOrder} open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)} />
      )}
    </>
  )
}
