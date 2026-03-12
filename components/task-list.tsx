"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Circle,
  ExternalLink,
  MoreHorizontal,
  NotebookText,
  UserCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { useTasks } from "@/hooks/use-tasks"
import { buildICSCalendar, buildICSEvent, downloadICS, googleCalendarUrl } from "@/lib/calendar"
import { formatDateShort, formatTimeHM, isOverdue, isToday, safeDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import { formatEnumLabel, getTaskPriorityTone, getTaskTypeTone, getTaskUrgencyTone } from "@/lib/workspace-ui"
import type { Client } from "@/types/client"
import type { Task } from "@/types/task"

interface TaskListProps {
  tasks: Task[]
  clients: Client[]
}

type TaskFilter = "all" | "follow-up" | "call" | "email" | "meeting"

const FILTERS: Array<{ key: TaskFilter; label: string }> = [
  { key: "all", label: "All open" },
  { key: "follow-up", label: "Follow-ups" },
  { key: "call", label: "Calls" },
  { key: "email", label: "Emails" },
  { key: "meeting", label: "Meetings" },
]

export function TaskList({ tasks, clients }: TaskListProps) {
  const { toggleTask } = useTasks()
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (activeFilter === "all") return true
        return task.type === activeFilter
      }),
    [activeFilter, tasks],
  )

  const overdueTasks = useMemo(
    () =>
      filteredTasks
        .filter((task) => isOverdue(task.dueDate, task.completed))
        .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0)),
    [filteredTasks],
  )
  const todayTasks = useMemo(
    () =>
      filteredTasks
        .filter((task) => !task.completed && isToday(task.dueDate))
        .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0)),
    [filteredTasks],
  )
  const upcomingTasks = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return filteredTasks
      .filter((task) => {
        const date = safeDate(task.dueDate)
        return !!date && !task.completed && !isToday(task.dueDate) && date >= now && date <= nextWeek
      })
      .sort((a, b) => (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0))
  }, [filteredTasks])
  const completedTasks = useMemo(
    () =>
      filteredTasks
        .filter((task) => task.completed)
        .sort((a, b) => (safeDate(b.dueDate)?.getTime() ?? 0) - (safeDate(a.dueDate)?.getTime() ?? 0))
        .slice(0, 6),
    [filteredTasks],
  )

  const openTasks = useMemo(() => [...overdueTasks, ...todayTasks, ...upcomingTasks], [overdueTasks, todayTasks, upcomingTasks])

  useEffect(() => {
    const nextSelection = openTasks[0]?.id ?? completedTasks[0]?.id ?? null
    if (!selectedTaskId || !filteredTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(nextSelection)
    }
  }, [completedTasks, filteredTasks, openTasks, selectedTaskId])

  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ??
    openTasks[0] ??
    completedTasks[0] ??
    null
  const selectedClient = clients.find((client) => client.id === selectedTask?.clientId) ?? null

  const exportAllTasksICS = () => {
    if (tasks.length === 0) return
    const ics = buildICSCalendar(tasks, clients)
    downloadICS(`clientive-tasks-${new Date().toISOString().split("T")[0]}.ics`, ics)
  }

  const downloadTaskICS = (task: Task) => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AVD Clientive//Task//EN",
      buildICSEvent(task, getClientName(task.clientId, clients)),
      "END:VCALENDAR",
    ].join("\r\n")
    downloadICS(`task-${task.id}.ics`, ics)
  }

  const openTaskInGoogleCalendar = (task: Task) => {
    const url = googleCalendarUrl(task, getClientName(task.clientId, clients))
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const openLinkedClient = () => {
    if (!selectedTask) return
    const params = new URLSearchParams(window.location.search)
    params.set("tab", "clients")
    window.location.assign(`/dashboard?${params.toString()}`)
  }

  if (tasks.length === 0) {
    return (
      <div className="border border-dashed border-border p-6">
        <div className="flex flex-col items-start gap-4">
          <div className="card-passive grid h-11 w-11 place-items-center text-muted-foreground">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans text-lg font-semibold text-foreground">No tasks in the queue</h3>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Create one follow-up and the workspace will start organizing what is overdue, due today, and coming next.
            </p>
          </div>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-add-task"))
              }
            }}
          >
            Add task
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden border-t border-border">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="ui-kicker">Execution queue</p>
                <h2 className="font-sans text-lg font-semibold text-foreground">Grouped by urgency, not buried in a table</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      "rounded-[10px] border px-3 py-2 text-xs font-medium transition-colors",
                      activeFilter === filter.key
                        ? "border-foreground/10 bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
                <Button size="sm" variant="outline" onClick={exportAllTasksICS}>
                  <CalendarPlus className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-4">
            <TaskGroup
              title="Overdue"
              caption="Past the due time and should move first."
              tasks={overdueTasks}
              selectedTaskId={selectedTask?.id ?? null}
              clients={clients}
              onSelect={setSelectedTaskId}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onToggle={toggleTask}
            />
            <TaskGroup
              title="Today"
              caption="Commitments scheduled for the current day."
              tasks={todayTasks}
              selectedTaskId={selectedTask?.id ?? null}
              clients={clients}
              onSelect={setSelectedTaskId}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onToggle={toggleTask}
            />
            <TaskGroup
              title="Next 7 days"
              caption="Near-term work already planned."
              tasks={upcomingTasks}
              selectedTaskId={selectedTask?.id ?? null}
              clients={clients}
              onSelect={setSelectedTaskId}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onToggle={toggleTask}
            />
            <TaskGroup
              title="Completed recently"
              caption="Still visible for context and follow-through."
              tasks={completedTasks}
              selectedTaskId={selectedTask?.id ?? null}
              clients={clients}
              onSelect={setSelectedTaskId}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onToggle={toggleTask}
            />
          </div>
        </div>

        <aside className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          {selectedTask ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="ui-kicker">Selected task</p>
                    <h3 className="mt-1 font-sans text-xl font-semibold text-foreground">{selectedTask.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTaskUrgencyTone(selectedTask)}>
                      {selectedTask.completed ? "Completed" : isOverdue(selectedTask.dueDate, false) ? "Overdue" : isToday(selectedTask.dueDate) ? "Today" : "Upcoming"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getTaskTypeTone(selectedTask.type)}>{formatEnumLabel(selectedTask.type)}</Badge>
                  <Badge className={getTaskPriorityTone(selectedTask.priority)}>{formatEnumLabel(selectedTask.priority)}</Badge>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border-t border-border pt-3">
                  <p className="ui-kicker">Due</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {formatDateShort(selectedTask.dueDate)} at {formatTimeHM(selectedTask.dueDate)}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="ui-kicker">Linked client</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{selectedClient?.name || "Unknown client"}</p>
                  <p className="ui-meta mt-1">{selectedClient?.company || selectedClient?.email || "No relationship context is attached."}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="ui-kicker">Reminder behavior</p>
                  <p className="mt-2 text-sm text-foreground">{selectedTask.emailNotify ? "Email reminder enabled" : "App-only reminder"}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="ui-kicker">Context</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {selectedTask.description || "Add a short note so this task is easy to complete when it comes back into view."}
                </p>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => toggleTask(selectedTask.id)}>
                  {selectedTask.completed ? (
                    <>
                      <Circle className="h-4 w-4" />
                      Reopen task
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark complete
                    </>
                  )}
                </Button>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <Button variant="outline" onClick={() => setEditingTask(selectedTask)}>
                    <NotebookText className="h-4 w-4" />
                    Edit task
                  </Button>
                  <Button variant="outline" onClick={openLinkedClient} disabled={!selectedClient}>
                    <UserCircle2 className="h-4 w-4" />
                    Open linked client
                  </Button>
                  <Button variant="outline" onClick={() => downloadTaskICS(selectedTask)}>
                    <CalendarPlus className="h-4 w-4" />
                    Download calendar file
                  </Button>
                  <Button variant="outline" onClick={() => openTaskInGoogleCalendar(selectedTask)}>
                    <ExternalLink className="h-4 w-4" />
                    Google Calendar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="ui-kicker">Task detail</p>
              <h3 className="font-sans text-base font-semibold text-foreground">Select a task</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                The detail rail shows due timing, linked client context, reminder behavior, and quick actions.
              </p>
            </div>
          )}
        </aside>
      </div>

      {editingTask ? (
        <EditTaskDialog task={editingTask} clients={clients} open={!!editingTask} onOpenChange={() => setEditingTask(null)} />
      ) : null}
      {deletingTask ? (
        <DeleteTaskDialog task={deletingTask} open={!!deletingTask} onOpenChange={() => setDeletingTask(null)} />
      ) : null}
    </>
  )
}

function TaskGroup({
  title,
  caption,
  tasks,
  selectedTaskId,
  clients,
  onSelect,
  onEdit,
  onDelete,
  onToggle,
}: {
  title: string
  caption: string
  tasks: Task[]
  selectedTaskId: string | null
  clients: Client[]
  onSelect: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggle: (id: string) => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-sans text-sm font-semibold text-foreground">{title}</h3>
          <p className="ui-meta mt-1">{caption}</p>
        </div>
        <span className="ui-meta">{tasks.length}</span>
      </div>

      {tasks.length > 0 ? (
        <div className="border-t border-border/80">
          {tasks.map((task) => {
            const clientName = getClientName(task.clientId, clients)
            const isSelected = selectedTaskId === task.id

            return (
              <div key={task.id} className={cn("border-b border-border/80 transition-colors last:border-b-0", isSelected ? "bg-[hsl(var(--surface-soft))/0.28]" : "bg-transparent")}>
                <div className="flex items-start gap-3 px-2 py-4">
                  <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} className="mt-1" />
                  <button
                    type="button"
                    onClick={() => onSelect(task.id)}
                    className="grid flex-1 gap-3 text-left lg:grid-cols-[minmax(0,1.1fr)_0.7fr_0.7fr_auto]"
                  >
                    <div className="space-y-2">
                      <p className={cn("font-medium text-foreground", task.completed ? "line-through text-muted-foreground" : undefined)}>
                        {task.title}
                      </p>
                      <p className="ui-meta">{task.description || "No additional context added yet."}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{clientName}</p>
                      <p className="ui-meta">{formatEnumLabel(task.type)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{formatDateShort(task.dueDate)}</p>
                      <p className="ui-meta">{formatTimeHM(task.dueDate)}</p>
                    </div>
                    <div className="flex justify-start lg:justify-end">
                      <Badge className={getTaskUrgencyTone(task)}>
                        {task.completed ? "Completed" : isOverdue(task.dueDate, false) ? "Overdue" : isToday(task.dueDate) ? "Today" : "Upcoming"}
                      </Badge>
                    </div>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>Edit task</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive">
                        Delete task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">Nothing in this section right now.</p>
        </div>
      )}
    </section>
  )
}

function getClientName(clientId: string, clients: Client[]) {
  return clients.find((client) => client.id === clientId)?.name || "Unknown client"
}
