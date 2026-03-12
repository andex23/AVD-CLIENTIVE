import type { Client } from "@/types/client"
import type { Order } from "@/types/order"
import type { Task } from "@/types/task"
import { isOverdue, isToday, safeDate } from "@/lib/date"

export function formatEnumLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function getClientStageTone(status: Client["status"]) {
  switch (status) {
    case "vip":
      return "border-transparent bg-primary/14 text-primary"
    case "active":
      return "border-transparent bg-emerald-100 text-emerald-800"
    case "lead":
      return "border-transparent bg-amber-100 text-amber-800"
    case "prospect":
      return "border-transparent bg-sky-100 text-sky-800"
    default:
      return "border-border bg-[hsl(var(--surface-soft))] text-muted-foreground"
  }
}

export function getTaskTypeTone(type: Task["type"]) {
  switch (type) {
    case "call":
      return "border-transparent bg-sky-100 text-sky-800"
    case "email":
      return "border-transparent bg-orange-100 text-orange-800"
    case "meeting":
      return "border-transparent bg-violet-100 text-violet-800"
    default:
      return "border-transparent bg-emerald-100 text-emerald-800"
  }
}

export function getTaskPriorityTone(priority: Task["priority"]) {
  switch (priority) {
    case "high":
      return "border-transparent bg-rose-100 text-rose-700"
    case "medium":
      return "border-transparent bg-amber-100 text-amber-800"
    default:
      return "border-transparent bg-emerald-100 text-emerald-800"
  }
}

export function getOrderStatusTone(status: Order["status"]) {
  switch (status) {
    case "completed":
      return "border-transparent bg-emerald-100 text-emerald-800"
    case "processing":
      return "border-transparent bg-sky-100 text-sky-800"
    case "pending":
      return "border-transparent bg-amber-100 text-amber-800"
    default:
      return "border-transparent bg-rose-100 text-rose-700"
  }
}

export function getTaskUrgencyTone(task: Task) {
  if (task.completed) {
    return "border-border/80 bg-[hsl(var(--surface-soft))/0.45] text-muted-foreground"
  }

  if (isOverdue(task.dueDate, task.completed)) {
    return "border-destructive/25 bg-destructive/5 text-destructive"
  }

  if (isToday(task.dueDate)) {
    return "border-primary/25 bg-primary/6 text-primary"
  }

  return "border-border/80 bg-[hsl(var(--surface-soft))/0.55] text-muted-foreground"
}

export function getClientAttentionState(client: Client, tasks: Task[]) {
  const nextTask = tasks
    .filter((task) => task.clientId === client.id && !task.completed)
    .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0))[0]
  const lastTouch = safeDate(client.lastContact)
  const ageDays = lastTouch ? Math.floor((Date.now() - lastTouch.getTime()) / (1000 * 60 * 60 * 24)) : 0

  if (nextTask && isOverdue(nextTask.dueDate, nextTask.completed)) {
    return {
      label: "Follow-up overdue",
      tone: "border-destructive/25 bg-destructive/6 text-destructive",
    }
  }

  if (ageDays >= 14) {
    return {
      label: "Needs touch",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
    }
  }

  if (client.status === "active" || client.status === "vip") {
    return {
      label: "Warm",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    }
  }

  return {
    label: "In motion",
    tone: "border-border bg-[hsl(var(--surface-soft))] text-muted-foreground",
  }
}
