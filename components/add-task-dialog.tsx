"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { CalendarClock, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSettings } from "@/hooks/use-settings"
import { useTasks } from "@/hooks/use-tasks"
import type { Client } from "@/types/client"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
}

const PRESETS = [
  { label: "Follow up today", title: "Follow up today", type: "follow-up" as const, offsetHours: 3 },
  { label: "Send proposal", title: "Send proposal", type: "email" as const, offsetHours: 24 },
  { label: "Payment reminder", title: "Payment reminder", type: "email" as const, offsetHours: 48 },
  { label: "Weekly check-in", title: "Weekly check-in", type: "call" as const, offsetHours: 7 * 24 },
]

function futureInputValue(offsetHours: number) {
  const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000)
  date.setSeconds(0, 0)
  return date.toISOString().slice(0, 16)
}

export function AddTaskDialog({ open, onOpenChange, clients }: AddTaskDialogProps) {
  const { addTask } = useTasks()
  const { settings } = useSettings()
  const [formData, setFormData] = useState<{
    title: string
    description: string
    clientId: string
    dueDate: string
    type: "call" | "email" | "meeting" | "follow-up"
    priority: "low" | "medium" | "high"
    emailNotify: boolean
  }>({
    title: "",
    description: "",
    clientId: "",
    dueDate: "",
    type: "follow-up" as const,
    priority: "medium" as const,
    emailNotify: false,
  })

  useEffect(() => {
    if (open) {
      setFormData((current) => ({
        ...current,
        emailNotify: settings.emailNotificationsEnabled,
        dueDate: current.dueDate || futureInputValue(24),
      }))
    }
  }, [open, settings.emailNotificationsEnabled])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.title || !formData.clientId || !formData.dueDate) return

    await addTask({
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      completed: false,
    })

    setFormData({
      title: "",
      description: "",
      clientId: "",
      dueDate: futureInputValue(24),
      type: "follow-up",
      priority: "medium",
      emailNotify: settings.emailNotificationsEnabled,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-[hsl(var(--surface-ivory))] sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl">Add task</DialogTitle>
          <DialogDescription>Keep follow-ups fast: title, client, timing, and a little context. Nothing bloated.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="card-passive space-y-3 p-4">
            <div>
              <p className="ui-kicker">Quick presets</p>
              <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Start from a common follow-up</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      title: preset.title,
                      type: preset.type,
                      dueDate: futureInputValue(preset.offsetHours),
                    }))
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <section className="card-passive space-y-3 p-4">
              <div>
                <p className="ui-kicker">Task</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">What needs to happen?</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-title">Title *</Label>
                <Input
                  id="task-title"
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Call Jane about the proposal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-note">Short note</Label>
                <Textarea
                  id="task-note"
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Anything the future you should know before doing this."
                />
              </div>
            </section>

            <section className="card-passive space-y-3 p-4">
              <div>
                <p className="ui-kicker">Linked client</p>
                <h3 className="mt-1 font-sans text-base font-semibold text-foreground">Attach the relationship</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-client">Client *</Label>
                <Select value={formData.clientId || undefined} onValueChange={(value) => setFormData((current) => ({ ...current, clientId: value }))}>
                  <SelectTrigger id="task-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company ? `(${client.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-type">Task type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData((current) => ({ ...current, type: value as typeof formData.type }))}>
                    <SelectTrigger id="task-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData((current) => ({ ...current, priority: value as typeof formData.priority }))}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>

          <section className="card-passive space-y-3 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date & time *</Label>
                <Input
                  id="task-due"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(event) => setFormData((current) => ({ ...current, dueDate: event.target.value }))}
                  required
                />
              </div>
              <div className="card-passive flex items-center gap-3 px-3 py-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <div>
                  <p className="ui-kicker">Reminder</p>
                  <p className="text-sm text-foreground">{formData.emailNotify ? "Email + app" : "App only"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="task-email-notify"
                checked={formData.emailNotify}
                onCheckedChange={(checked) => setFormData((current) => ({ ...current, emailNotify: Boolean(checked) }))}
              />
              <Label htmlFor="task-email-notify" className="flex items-center gap-2 text-sm font-normal">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                Send an email reminder for this task
              </Label>
            </div>
          </section>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
