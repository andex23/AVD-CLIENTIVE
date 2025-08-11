"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useOrders } from "@/hooks/use-orders"
import type { Order } from "@/types/order"

interface DeleteOrderDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteOrderDialog({ order, open, onOpenChange }: DeleteOrderDialogProps) {
  const { deleteOrder } = useOrders()

  const handleDelete = () => {
    deleteOrder(order.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the order for "{order.product}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
