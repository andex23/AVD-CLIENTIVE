"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTasks } from "@/hooks/use-tasks"
import type { Client } from "@/types/client"
import type { Task } from "@/types/task"

interface EditTaskDialogProps {
  task: Task
  clients: Client[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function moveHours(hours: number) {
  const date = new Date(Date.now() + hours * 60 * 60 * 1000)
  date.setSeconds(0, 0)
  return date.toISOString().slice(0, 16)
}

export function EditTaskDialog({ task, clients, open, onOpenChange }: EditTaskDialogProps) {
  const { updateTask } = useTasks()
  const [formData, setFormData] = useState<{
    title: string
    description: string
    clientId: string
    dueDate: string
    type: Task["type"]
    priority: Task["priority"]
    emailNotify: boolean
    completed: boolean
  }>({
    title: "",
    description: "",
    clientId: "",
    dueDate: "",
    type: "follow-up" as const,
    priority: "medium" as const,
    emailNotify: false,
    completed: false,
  })

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || "",
      clientId: task.clientId,
      dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
      type: task.type,
      priority: task.priority,
      emailNotify: !!task.emailNotify,
      completed: task.completed,
    })
  }, [task])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.title || !formData.clientId || !formData.dueDate) return

    await updateTask(task.id, {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-[hsl(var(--surface-ivory))] sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl">Edit task</DialogTitle>
          <DialogDescription>Reschedule, update context, or close the task without leaving the operating flow.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="card-passive space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setFormData((current) => ({ ...current, dueDate: moveHours(24) }))}>
                Tomorrow morning
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setFormData((current) => ({ ...current, dueDate: moveHours(72) }))}>
                Push 3 days
              </Button>
              <Button
                type="button"
                size="sm"
                variant={formData.completed ? "outline" : "default"}
                onClick={() => setFormData((current) => ({ ...current, completed: !current.completed }))}
              >
                {formData.completed ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {formData.completed ? "Reopen" : "Mark complete"}
              </Button>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <section className="card-passive space-y-3 p-4">
              <p className="ui-kicker">Task details</p>
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">Title *</Label>
                <Input id="edit-task-title" value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-note">Note / context</Label>
                <Textarea id="edit-task-note" value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} />
              </div>
            </section>

            <section className="card-passive space-y-3 p-4">
              <p className="ui-kicker">Linked relationship</p>
              <div className="space-y-2">
                <Label htmlFor="edit-task-client">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData((current) => ({ ...current, clientId: value }))}>
                  <SelectTrigger id="edit-task-client">
                    <SelectValue />
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
                  <Label htmlFor="edit-task-type">Task type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData((current) => ({ ...current, type: value as typeof formData.type }))}>
                    <SelectTrigger id="edit-task-type">
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
                  <Label htmlFor="edit-task-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData((current) => ({ ...current, priority: value as typeof formData.priority }))}>
                    <SelectTrigger id="edit-task-priority">
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
                <Label htmlFor="edit-task-date">Due date & time *</Label>
                <Input id="edit-task-date" type="datetime-local" value={formData.dueDate} onChange={(event) => setFormData((current) => ({ ...current, dueDate: event.target.value }))} required />
              </div>
              <div className="flex items-center gap-3 rounded-[14px] border border-border/90 bg-background/80 px-3 py-2">
                <Checkbox id="edit-task-email" checked={formData.emailNotify} onCheckedChange={(checked) => setFormData((current) => ({ ...current, emailNotify: Boolean(checked) }))} />
                <Label htmlFor="edit-task-email" className="text-sm font-normal">
                  Email reminder
                </Label>
              </div>
            </div>
          </section>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
