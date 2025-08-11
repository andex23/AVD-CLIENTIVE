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
import { Checkbox } from "@/components/ui/checkbox"
import { useTasks } from "@/hooks/use-tasks"
import type { Task } from "@/types/task"
import type { Client } from "@/types/client"

interface EditTaskDialogProps {
  task: Task
  clients: Client[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, clients, open, onOpenChange }: EditTaskDialogProps) {
  const { updateTask } = useTasks()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    dueDate: "",
    type: "follow-up" as const,
    priority: "medium" as const,
    emailNotify: false,
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        clientId: task.clientId,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
        type: task.type,
        priority: task.priority,
        emailNotify: !!task.emailNotify,
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.clientId || !formData.dueDate) return

    updateTask(task.id, {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
                <Label htmlFor="amount">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Due Date *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Task Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
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
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="emailNotify"
                checked={formData.emailNotify}
                onCheckedChange={(v) => setFormData((prev) => ({ ...prev, emailNotify: Boolean(v) }))}
              />
              <Label htmlFor="emailNotify" className="text-sm">
                Email reminder for this task
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
