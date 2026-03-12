"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useClients } from "@/hooks/use-clients"
import type { Client } from "@/types/client"

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const { updateClient } = useClients()
  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
    company: string
    status: Client["status"]
    notes: string
    tags: string[]
  }>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "prospect" as const,
    notes: "",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
      status: client.status,
      notes: client.notes || "",
      tags: client.tags,
    })
  }, [client])

  const addTag = () => {
    const trimmed = newTag.trim()
    if (!trimmed || formData.tags.includes(trimmed)) return
    setFormData((current) => ({ ...current, tags: [...current.tags, trimmed] }))
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.name || !formData.email) return

    await updateClient(client.id, {
      ...formData,
      lastContact: client.lastContact,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-[hsl(var(--surface-ivory))] sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl">Edit client</DialogTitle>
          <DialogDescription>Refine the relationship record without turning it into a heavy CRM form.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="card-passive space-y-3 p-4">
              <p className="ui-kicker">Identity</p>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-client-name">Name *</Label>
                  <Input id="edit-client-name" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-client-company">Business / context</Label>
                  <Input id="edit-client-company" value={formData.company} onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))} />
                </div>
              </div>
            </section>

            <section className="card-passive space-y-3 p-4">
              <p className="ui-kicker">Contact methods</p>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-client-email">Email *</Label>
                  <Input id="edit-client-email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-client-phone">Phone</Label>
                  <Input id="edit-client-phone" value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
            <section className="card-passive space-y-3 p-4">
              <p className="ui-kicker">Stage</p>
              <Select value={formData.status} onValueChange={(value) => setFormData((current) => ({ ...current, status: value as typeof formData.status }))}>
                <SelectTrigger>
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
            </section>

            <section className="card-passive space-y-3 p-4">
              <p className="ui-kicker">Tags</p>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  placeholder="Referral, VIP, Retainer"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex min-h-8 flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-border/80 bg-background/85 pr-1">
                    {tag}
                    <button type="button" className="ml-2 text-muted-foreground" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          <section className="card-passive space-y-3 p-4">
            <p className="ui-kicker">Notes</p>
            <Textarea value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} placeholder="Short relationship notes, tone cues, or project context." />
          </section>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
