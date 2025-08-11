"use client"

import { useEffect, useRef } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { safeDate } from "@/lib/date"

const NOTIFY_WINDOW_MIN = 5 // minutes window before/after due to notify

export function TaskNotifier() {
  const { tasks } = useTasks()
  const notified = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!("Notification" in window)) return
      if (Notification.permission !== "granted") return

      const now = Date.now()
      const windowMs = NOTIFY_WINDOW_MIN * 60 * 1000

      for (const t of tasks) {
        const due = safeDate(t.dueDate)?.getTime()
        if (!due || t.completed) continue

        const withinWindow =
          (now >= due && now - due <= 24 * 60 * 60 * 1000) || // overdue within 24h
          (due >= now && due - now <= windowMs) // due soon

        if (withinWindow && !notified.current.has(t.id)) {
          try {
            const n = new Notification(`${t.title}`, {
              body: `Due ${new Date(t.dueDate).toLocaleString()}`,
            })
            n.onclick = () => window.focus()
            notified.current.add(t.id)
          } catch {
            // ignore notification errors
          }
        }
      }
    }, 60 * 1000) // check every minute

    return () => clearInterval(interval)
  }, [tasks])

  return null
}
