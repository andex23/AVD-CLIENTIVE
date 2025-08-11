"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageCircle, Phone, Mail } from "lucide-react"
import type { Client } from "@/types/client"

interface QuickActionsDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickActionsDialog({ client, open, onOpenChange }: QuickActionsDialogProps) {
  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${client.phone?.replace(/\D/g, "")}?text=Hi ${client.name}, `
    window.open(whatsappUrl, "_blank")
    onOpenChange(false)
  }

  const handleCall = () => {
    window.open(`tel:${client.phone}`, "_self")
    onOpenChange(false)
  }

  const handleEmail = () => {
    window.open(`mailto:${client.email}?subject=Follow up&body=Hi ${client.name},%0D%0A%0D%0A`, "_self")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Quick Actions - {client.name}</DialogTitle>
          <DialogDescription>Choose how you'd like to contact this client.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {client.phone && (
            <Button
              onClick={handleWhatsApp}
              className="flex items-center justify-start gap-3 h-12 bg-transparent"
              variant="outline"
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm text-muted-foreground">{client.phone}</div>
              </div>
            </Button>
          )}

          {client.phone && (
            <Button
              onClick={handleCall}
              className="flex items-center justify-start gap-3 h-12 bg-transparent"
              variant="outline"
            >
              <Phone className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Call</div>
                <div className="text-sm text-muted-foreground">{client.phone}</div>
              </div>
            </Button>
          )}

          <Button
            onClick={handleEmail}
            className="flex items-center justify-start gap-3 h-12 bg-transparent"
            variant="outline"
          >
            <Mail className="h-5 w-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{client.email}</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
