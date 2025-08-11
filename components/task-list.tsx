"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  User,
  Edit,
  Trash2,
  AlertCircle,
  CalendarPlus,
  ExternalLink,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"
import { useTasks } from "@/hooks/use-tasks"
import type { Task } from "@/types/task"
import type { Client } from "@/types/client"
import { formatDateShort, formatTimeHM, isOverdue as overdueCheck, isToday as todayCheck, safeDate } from "@/lib/date"
import { buildICSCalendar, buildICSEvent, downloadICS, googleCalendarUrl } from "@/lib/calendar"

interface TaskListProps {
  tasks: Task[]
  clients: Client[]
}

export function TaskList({ tasks, clients }: TaskListProps) {
  const { toggleTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const isOverdue = (date: string, completed: boolean) => overdueCheck(date, completed)
  const isToday = (date: string) => todayCheck(date)

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "Unknown Client"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-800"
      case "email":
        return "bg-orange-100 text-orange-800"
      case "meeting":
        return "bg-purple-100 text-purple-800"
      case "follow-up":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate, a.completed)
    const bOverdue = isOverdue(b.dueDate, b.completed)
    const aToday = isToday(a.dueDate)
    const bToday = isToday(b.dueDate)

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    if (aToday && !bToday) return -1
    if (!aToday && bToday) return 1

    return (safeDate(a.dueDate)?.getTime() ?? 0) - (safeDate(b.dueDate)?.getTime() ?? 0)
  })

  // Calendar helpers
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
      buildICSEvent(task, getClientName(task.clientId)),
      "END:VCALENDAR",
    ].join("\r\n")
    downloadICS(`task-${task.id}.ics`, ics)
  }

  const openTaskInGoogleCalendar = (task: Task) => {
    const url = googleCalendarUrl(task, getClientName(task.clientId))
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first task to start managing follow-ups and reminders.
          </p>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-add-task"))
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Tasks & Follow-ups ({tasks.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportAllTasksICS} title="Export all tasks to .ics">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Export .ics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.completed)
                const today = isToday(task.dueDate)

                return (
                  <TableRow
                    key={task.id}
                    className={`${task.completed ? "opacity-60" : ""} ${
                      overdue
                        ? "bg-red-50 border-l-4 border-l-red-500"
                        : today
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                    }`}
                  >
                    <TableCell>
                      <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${task.completed ? "line-through" : ""}`}>
                        {overdue && !task.completed && <AlertCircle className="inline h-4 w-4 text-red-500 mr-2" />}
                        {task.title}
                      </div>
                      {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{getClientName(task.clientId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={overdue ? "text-red-600 font-medium" : today ? "text-blue-600 font-medium" : ""}
                          >
                            {formatDateShort(task.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatTimeHM(task.dueDate)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTaskTypeColor(task.type)}>{task.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {task.completed ? "Completed" : overdue ? "Overdue" : today ? "Due Today" : "Pending"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingTask(task)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadTaskICS(task)}>
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Add to Calendar (.ics)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openTaskInGoogleCalendar(task)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Add to Google Calendar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          clients={clients}
          open={!!editingTask}
          onOpenChange={() => setEditingTask(null)}
        />
      )}

      {deletingTask && (
        <DeleteTaskDialog task={deletingTask} open={!!deletingTask} onOpenChange={() => setDeletingTask(null)} />
      )}
    </>
  )
}
