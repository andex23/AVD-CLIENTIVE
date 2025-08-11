export function safeDate(input?: string | Date | null): Date | null {
  if (!input) return null
  const d = input instanceof Date ? input : new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

export function isToday(dateInput?: string): boolean {
  const d = safeDate(dateInput)
  if (!d) return false
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function isOverdue(dateInput?: string, completed = false): boolean {
  if (completed) return false
  const d = safeDate(dateInput)
  if (!d) return false
  return d.getTime() < Date.now()
}

export function formatDateShort(dateInput?: string): string {
  const d = safeDate(dateInput)
  return d ? d.toLocaleDateString() : "-"
}

export function formatTimeHM(dateInput?: string): string {
  const d = safeDate(dateInput)
  return d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"
}

export function timeAgo(dateInput?: string): string {
  const d = safeDate(dateInput)
  if (!d) return "-"
  const diffMs = Date.now() - d.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return "Just now"
  if (diffH < 24) return `${diffH}h ago`
  if (diffH < 48) return "Yesterday"
  return d.toLocaleDateString()
}
