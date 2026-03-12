"use client"

import * as React from "react"
import type { Task } from "@/types/task"
import { apiFetch } from "@/lib/api-client"
import { safeDate } from "@/lib/date"
import { demoTasks } from "@/lib/demo-data"

type TasksContextValue = {
  tasks: Task[]
  todaysTasks: Task[]
  upcomingTasks: Task[]
  addTask: (taskData: Omit<Task, "id">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
}

const TasksContext = React.createContext<TasksContextValue | null>(null)

const STORAGE_KEY = "crm:tasks"

function loadLocalTasks(isPreview: boolean): Task[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!raw) return isPreview ? demoTasks : []
    const parsed = JSON.parse(raw) as Task[]
    return Array.isArray(parsed) ? parsed : isPreview ? demoTasks : []
  } catch {
    return isPreview ? demoTasks : []
  }
}

function saveLocalTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // ignore
  }
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const { tasks } = await apiFetch<{ tasks: Task[] }>("/api/tasks")
        setTasks(tasks)
        saveLocalTasks(tasks)
      } catch (e) {
        const isPreview =
          typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1"
        console.warn("Tasks load failed; using local data.", e)
        setTasks(loadLocalTasks(isPreview))
      }
    }
    load()
  }, [])

  const addTask = React.useCallback(async (taskData: Omit<Task, "id">) => {
    try {
      const { task } = await apiFetch<{ task: Task }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      })
      setTasks((prev) => {
        const next = [task, ...prev]
        saveLocalTasks(next)
        return next
      })
    } catch (e) {
      const localTask: Task = { ...taskData, id: `local-${Date.now()}` }
      setTasks((prev) => {
        const next = [localTask, ...prev]
        saveLocalTasks(next)
        return next
      })
      console.error("Failed to add task (saved locally):", e)
    }
  }, [])

  const updateTask = React.useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const { task } = await apiFetch<{ task: Task }>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      })
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? task : t))
        saveLocalTasks(next)
        return next
      })
    } catch (e) {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        saveLocalTasks(next)
        return next
      })
      console.error("Failed to update task (saved locally):", e)
    }
  }, [])

  const deleteTask = React.useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "DELETE" })
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id)
        saveLocalTasks(next)
        return next
      })
    } catch (e) {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id)
        saveLocalTasks(next)
        return next
      })
      console.error("Failed to delete task (removed locally):", e)
    }
  }, [])

  const toggleTask = React.useCallback(
    async (id: string) => {
      const target = tasks.find((t) => t.id === id)
      if (!target) return
      await updateTask(id, { completed: !target.completed })
    },
    [tasks, updateTask],
  )

  const todaysTasks = React.useMemo(() => {
    const today = new Date()
    return tasks.filter((task) => {
      const d = safeDate(task.dueDate)
      return (
        !!d &&
        !task.completed &&
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      )
    })
  }, [tasks])

  const upcomingTasks = React.useMemo(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return tasks.filter((task) => {
      const d = safeDate(task.dueDate)
      return !!d && !task.completed && d >= now && d <= nextWeek
    })
  }, [tasks])

  return (
    <TasksContext.Provider value={{ tasks, todaysTasks, upcomingTasks, addTask, updateTask, deleteTask, toggleTask }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const ctx = React.useContext(TasksContext)
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider")
  return ctx
}
