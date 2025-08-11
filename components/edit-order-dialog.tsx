"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrders } from "@/hooks/use-orders"
import type { Order } from "@/types/order"
import type { Client } from "@/types/client"

interface EditOrderDialogProps {
  order: Order
  clients: Client[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditOrderDialog({ order, clients, open, onOpenChange }: EditOrderDialogProps) {
  const { updateOrder } = useOrders()
  const [formData, setFormData] = useState({
    product: "",
    description: "",
    clientId: "",
    amount: "",
    date: "",
    status: "pending" as const,
  })

  useEffect(() => {
    if (order) {
      setFormData({
        product: order.product,
        description: order.description || "",
        clientId: order.clientId,
        amount: order.amount.toString(),
        date: new Date(order.date).toISOString().split("T")[0],
        status: order.status,
      })
    }
  }, [order])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product || !formData.clientId || !formData.amount || !formData.date) return

    updateOrder(order.id, {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>Update order information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product/Service *</Label>
              <Input
                id="product"
                value={formData.product}
                onChange={(e) => setFormData((prev) => ({ ...prev, product: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Order Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
