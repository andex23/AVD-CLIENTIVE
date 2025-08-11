export interface Task {
  id: string
  title: string
  description?: string
  clientId: string
  dueDate: string
  type: "call" | "email" | "meeting" | "follow-up"
  priority: "low" | "medium" | "high"
  completed: boolean
  // New: whether to send an email reminder for this task
  emailNotify?: boolean
}
