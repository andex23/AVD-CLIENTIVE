"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { timeAgo } from "@/lib/date"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CheckCircle,
  Package,
  UserPlus,
  Clock,
  Minimize2,
  MessageCircle,
  Phone,
  Mail,
  User,
} from "lucide-react"
import type { Client } from "@/types/client"
import type { Task } from "@/types/task"
import type { Order } from "@/types/order"

export interface RecentActivityProps {
  clients: Client[]
  tasks: Task[]
  orders: Order[]
  userName?: string
}

interface ActivityItem {
  id: string
  type: "client" | "task" | "order"
  title: string
  subtitle: string
  date: string
  icon: React.ReactNode
  color: string
}

function RecentActivityComponent({ clients, tasks, orders, userName = "Jane" }: RecentActivityProps) {
  const [todaysTasksMinimized, setTodaysTasksMinimized] = useState(false)
  const [recentActivityMinimized, setRecentActivityMinimized] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    try {
      const seen = typeof window !== "undefined" ? localStorage.getItem("crm:hasVisited") : "1"
      setIsFirstVisit(!seen)
      localStorage.setItem("crm:hasVisited", "1")
    } catch {
      setIsFirstVisit(false)
    }
  }, [])

  const getClientById = (clientId: string) => clients.find((c) => c.id === clientId)
  const getClientName = (clientId: string) => getClientById(clientId)?.name || "Unknown Client"

  const formatDate = (date: string) => timeAgo(date)

  // Build the unified activity feed
  const activities: ActivityItem[] = [
    ...clients
      .filter((client) => {
        const clientDate = new Date(client.lastContact)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return clientDate >= weekAgo
      })
      .map((client) => ({
        id: `client-${client.id}`,
        type: "client" as const,
        title: `New client: ${client.name}`,
        subtitle: client.company || client.email,
        date: client.lastContact,
        icon: <UserPlus className="h-4 w-4" />,
        color: "text-blue-600",
      })),
    ...tasks
      .filter((task) => task.completed)
      .slice(0, 5)
      .map((task) => ({
        id: `task-${task.id}`,
        type: "task" as const,
        title: `Completed: ${task.title}`,
        subtitle: getClientName(task.clientId),
        date: task.dueDate,
        icon: <CheckCircle className="h-4 w-4" />,
        color: "text-green-600",
      })),
    ...orders.slice(0, 5).map((order) => ({
      id: `order-${order.id}`,
      type: "order" as const,
      title: `Order: ${order.product}`,
      subtitle: `${getClientName(order.clientId)} - $${order.amount.toFixed(2)}`,
      date: order.date,
      icon: <Package className="h-4 w-4" />,
      color: "text-purple-600",
    })),
  ]

  // Sort newest first
  const sortedActivities = useMemo(
    () => activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clients, tasks, orders],
  )

  // Today’s tasks
  const todaysTasks = useMemo(() => {
    const today = new Date()
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      return (
        !task.completed &&
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      )
    })
  }, [tasks])

  const openAddTask = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-add-task"))
    }
  }

  const handleWhatsApp = (clientId: string) => {
    const c = getClientById(clientId)
    if (!c?.phone) return
    const whatsappUrl = `https://wa.me/${c.phone.replace(/\D/g, "")}?text=Hi ${c.name}, `
    window.open(whatsappUrl, "_blank")
  }

  const handleCall = (clientId: string) => {
    const c = getClientById(clientId)
    if (!c?.phone) return
    window.open(`tel:${c.phone}`, "_self")
  }

  const handleEmail = (clientId: string) => {
    const c = getClientById(clientId)
    if (!c?.email) return
    window.open(`mailto:${c.email}?subject=Follow up&body=Hi ${c.name},%0D%0A%0D%0A`, "_self")
  }

  const greetingTitle = isFirstVisit ? `Hi ${userName}` : `Welcome back, ${userName}`

  const todaysTasksCard = (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {"Today's Tasks"} ({todaysTasks.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTodaysTasksMinimized(true)}
            className="h-6 w-6 p-0"
            aria-label="Minimize Today's Tasks"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {todaysTasks.length > 0 ? (
          <div className="divide-y divide-muted rounded-md border">
            {todaysTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-slate-100 grid place-items-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{getClientName(task.clientId)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {getClientById(task.clientId)?.phone && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleWhatsApp(task.clientId)}
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCall(task.clientId)}
                        title="Call"
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEmail(task.clientId)}
                    title="Email"
                  >
                    <Mail className="h-4 w-4 text-orange-600" />
                  </Button>
                </div>
              </div>
            ))}
            {todaysTasks.length > 5 && (
              <div className="p-2 text-xs text-muted-foreground text-center">+{todaysTasks.length - 5} more tasks</div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded border p-3">
            <p className="text-sm text-muted-foreground">No tasks due today</p>
            <Button size="sm" onClick={openAddTask}>
              Create Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const recentActivityCard = (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRecentActivityMinimized(true)}
            className="h-6 w-6 p-0"
            aria-label="Minimize Recent Activity"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedActivities.length > 0 ? (
          <div className="divide-y divide-muted rounded-md border">
            {sortedActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3">
                <div className={`${activity.color}`}>{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{activity.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{activity.subtitle}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(activity.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      {/* Greeting banner placeholder kept simple */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-slate-50">
        <CardContent className="py-0" />
      </Card>

      {/* Two-up layout for Today's Tasks and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {!todaysTasksMinimized && todaysTasksCard}
        {!recentActivityMinimized && recentActivityCard}
      </div>

      {/* Minimized floating buttons */}
      {todaysTasksMinimized && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setTodaysTasksMinimized(false)}
            className="rounded-full h-12 w-12 shadow-lg bg-blue-600 hover:bg-blue-700 relative"
            size="sm"
            aria-label="Restore Today's Tasks"
          >
            <Clock className="h-5 w-5 text-white" />
          </Button>
        </div>
      )}

      {recentActivityMinimized && (
        <div className="fixed bottom-4 right-20 z-50">
          <Button
            onClick={() => setRecentActivityMinimized(false)}
            className="rounded-full h-12 w-12 shadow-lg bg-green-600 hover:bg-green-700 relative"
            size="sm"
            aria-label="Restore Recent Activity"
          >
            <Calendar className="h-5 w-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  )
}

export { RecentActivityComponent as RecentActivity }
export default RecentActivityComponent
