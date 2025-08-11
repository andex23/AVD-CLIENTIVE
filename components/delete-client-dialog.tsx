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
import { useClients } from "@/hooks/use-clients"
import type { Client } from "@/types/client"

interface DeleteClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteClientDialog({ client, open, onOpenChange }: DeleteClientDialogProps) {
  const { deleteClient } = useClients()

  const handleDelete = () => {
    deleteClient(client.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {client.name}? This action cannot be undone and will also delete all
            associated tasks and orders.
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
