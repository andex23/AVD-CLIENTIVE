"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { CalendarClock, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useClients } from "@/hooks/use-clients"
import { useTasks } from "@/hooks/use-tasks"

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getTomorrowValue() {
  const next = new Date()
  next.setDate(next.getDate() + 1)
  next.setHours(10, 0, 0, 0)
  return next.toISOString().slice(0, 16)
}

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const { addClient } = useClients()
  const { addTask } = useTasks()
  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
    company: string
    status: "active" | "inactive" | "prospect" | "lead" | "vip"
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
  const [submitting, setSubmitting] = useState(false)
  const [followUpEnabled, setFollowUpEnabled] = useState(false)
  const [followUpTitle, setFollowUpTitle] = useState("Initial follow-up")
  const [followUpDate, setFollowUpDate] = useState(getTomorrowValue())
  const [followUpType, setFollowUpType] = useState<"follow-up" | "call" | "email" | "meeting">("follow-up")

  const canSubmit = useMemo(() => !!formData.name && !!formData.email && !submitting, [formData.email, formData.name, submitting])

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "prospect",
      notes: "",
      tags: [],
    })
    setNewTag("")
    setFollowUpEnabled(false)
    setFollowUpTitle("Initial follow-up")
    setFollowUpDate(getTomorrowValue())
    setFollowUpType("follow-up")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)

    try {
      const client = await addClient({
        ...formData,
        lastContact: new Date().toISOString(),
        interactions: [],
      })

      if (followUpEnabled && followUpTitle.trim() && followUpDate) {
        await addTask({
          title: followUpTitle.trim(),
          description: `First planned follow-up for ${client.name}.`,
          clientId: client.id,
          dueDate: new Date(followUpDate).toISOString(),
          type: followUpType,
          priority: "medium",
          completed: false,
          emailNotify: false,
        })
      }

      resetForm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-[hsl(var(--surface-ivory))] sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl">New client</DialogTitle>
          <DialogDescription>
            Start a relationship record with just the essentials, then add the first follow-up if you already know the next move.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="card-passive space-y-3 p-4">
              <div>
                <p className="ui-kicker">Identity</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Who is this relationship with?</h3>
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Name *</Label>
                  <Input
                    id="client-name"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-company">Business / context</Label>
                  <Input
                    id="client-company"
                    value={formData.company}
                    onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))}
                    placeholder="Studio North"
                  />
                </div>
              </div>
            </section>

            <section className="card-passive space-y-3 p-4">
              <div>
                <p className="ui-kicker">Contact methods</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">How do you reach them?</h3>
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email *</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                    placeholder="jane@studionorth.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input
                    id="client-phone"
                    value={formData.phone}
                    onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
            <section className="card-passive space-y-3 p-4">
              <div>
                <p className="ui-kicker">Stage</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Relationship status</h3>
              </div>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((current) => ({ ...current, status: value as typeof formData.status }))}
              >
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
              <div>
                <p className="ui-kicker">Tags</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Keep grouping light</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  placeholder="Referral, Retainer, Warm lead"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={submitting}>
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
            <div>
              <p className="ui-kicker">Initial note</p>
              <h3 className="mt-1 font-sans text-base font-semibold text-foreground">What should you remember first?</h3>
            </div>
            <Textarea
              value={formData.notes}
              onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Short context about the relationship, project scope, or how this client came in."
            />
          </section>

          <section className="card-passive space-y-3 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="ui-kicker">Optional first follow-up</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Queue the next action now</h3>
              </div>
              <Button type="button" variant={followUpEnabled ? "default" : "outline"} size="sm" onClick={() => setFollowUpEnabled((current) => !current)}>
                <CalendarClock className="h-4 w-4" />
                {followUpEnabled ? "Included" : "Add follow-up"}
              </Button>
            </div>

            {followUpEnabled ? (
              <div className="grid gap-3 md:grid-cols-[1fr_0.7fr_0.6fr]">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-title">Task</Label>
                  <Input id="follow-up-title" value={followUpTitle} onChange={(event) => setFollowUpTitle(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">Due</Label>
                  <Input id="follow-up-date" type="datetime-local" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-type">Type</Label>
                  <Select value={followUpType} onValueChange={(value) => setFollowUpType(value as typeof followUpType)}>
                    <SelectTrigger id="follow-up-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
          </section>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Plus className="h-4 w-4" />
              {submitting ? "Saving..." : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
