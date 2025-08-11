import type { Task } from "@/types/task"
import type { Client } from "@/types/client"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function toICSDateUTC(date: Date) {
  const y = date.getUTCFullYear()
  const m = pad(date.getUTCMonth() + 1)
  const d = pad(date.getUTCDate())
  const hh = pad(date.getUTCHours())
  const mm = pad(date.getUTCMinutes())
  const ss = pad(date.getUTCSeconds())
  return `${y}${m}${d}T${hh}${mm}${ss}Z`
}

export function formatGoogleDateRange(start: Date, end: Date) {
  return `${toICSDateUTC(start)}/${toICSDateUTC(end)}`
}

function getTaskDates(task: Task) {
  const start = new Date(task.dueDate)
  const end = new Date(start.getTime() + 30 * 60 * 1000) // default 30-min duration
  return { start, end }
}

export function buildICSEvent(task: Task, clientName?: string) {
  const { start, end } = getTaskDates(task)
  const summary = `${task.title}${clientName ? ` — ${clientName}` : ""}`
  const description = task.description ? task.description.replace(/\r?\n/g, "\\n") : ""
  const uid = `task-${task.id}@clientive.local`

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDateUTC(new Date())}`,
    `DTSTART:${toICSDateUTC(start)}`,
    `DTEND:${toICSDateUTC(end)}`,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : "",
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n")
}

export function buildICSCalendar(tasks: Task[], clients: Client[]) {
  const findClient = (id: string) => clients.find((c) => c.id === id)?.name
  const events = tasks.map((t) => buildICSEvent(t, findClient(t.clientId))).join("\r\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AVD Clientive//CRM Tasks//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n")
}

export function downloadICS(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(task: Task, clientName?: string) {
  const { start, end } = getTaskDates(task)
  const text = encodeURIComponent(`${task.title}${clientName ? ` — ${clientName}` : ""}`)
  const details = encodeURIComponent(task.description || "")
  const dates = formatGoogleDateRange(start, end)
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${dates}`
}
