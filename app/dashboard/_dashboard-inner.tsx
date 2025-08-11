"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Download, Upload, Users, Calendar, Bell, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ClientList } from "@/components/client-list"
import { AddClientDialog } from "@/components/add-client-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { TaskList } from "@/components/task-list"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { OrderList } from "@/components/order-list"
import { AddOrderDialog } from "@/components/add-order-dialog"
import { ExportDialog } from "@/components/export-dialog"
import { FilterDialog } from "@/components/filter-dialog"
import { RecentActivity } from "@/components/recent-activity"
import { TaskNotifier } from "@/components/task-notifier"

import { ClientsProvider, useClients } from "@/hooks/use-clients"
import { TasksProvider, useTasks } from "@/hooks/use-tasks"
import { OrdersProvider, useOrders } from "@/hooks/use-orders"
import { SettingsProvider, useSettings } from "@/hooks/use-settings"

function DashboardShell() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddClient, setShowAddClient] = useState(false)
  const [showImportClients, setShowImportClients] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [activeTab, setActiveTab] = useState("clients")

  const { clients, filteredClients, searchClients, filterClients, recentClients } = useClients()
  const { tasks, todaysTasks, upcomingTasks } = useTasks()
  const { orders, inactiveClients } = useOrders()
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    searchClients(searchQuery)
  }, [searchQuery, searchClients])

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "active").length,
    todaysTasks: todaysTasks.length,
    recentClients: recentClients.length,
    totalOrders: orders.length,
    inactiveCustomers: inactiveClients.length,
  }

  return (
    <div className="min-h-screen bg-background">
      <TaskNotifier />
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-semibold font-mono">AVD Clientive</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="order-tracking"
                checked={settings.orderTrackingEnabled}
                onCheckedChange={(checked) => updateSettings({ orderTrackingEnabled: checked })}
              />
              <Label htmlFor="order-tracking" className="text-sm font-sans">
                Order Tracking
              </Label>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilter(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowImportClients(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">{stats.activeClients} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaysTasks}</div>
              <p className="text-xs text-muted-foreground">{upcomingTasks.length} upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Clients</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentClients}</div>
              <p className="text-xs text-muted-foreground">Added this week</p>
            </CardContent>
          </Card>
          {settings.orderTrackingEnabled && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.inactiveCustomers}</div>
                <p className="text-xs text-muted-foreground">No order in 30+ days</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="clients">Clients</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks & Follow-ups</TabsTrigger>
                  {settings.orderTrackingEnabled && <TabsTrigger value="orders">Orders</TabsTrigger>}
                </TabsList>
                <div className="flex space-x-2">
                  {activeTab === "clients" && (
                    <>
                      <Button variant="outline" onClick={() => setShowImportClients(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                      <Button onClick={() => setShowAddClient(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Button>
                    </>
                  )}
                  {activeTab === "tasks" && (
                    <Button onClick={() => setShowAddTask(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                  {activeTab === "orders" && settings.orderTrackingEnabled && (
                    <Button onClick={() => setShowAddOrder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Order
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="clients" className="space-y-4">
                <ClientList clients={filteredClients} orderTrackingEnabled={settings.orderTrackingEnabled} />
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <TaskList tasks={tasks} clients={clients} />
              </TabsContent>

              {settings.orderTrackingEnabled && (
                <TabsContent value="orders" className="space-y-4">
                  <OrderList orders={orders} clients={clients} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="space-y-4">
            <RecentActivity clients={clients} tasks={tasks} orders={orders} />
          </div>
        </div>
      </div>

      <AddClientDialog open={showAddClient} onOpenChange={setShowAddClient} />
      <ImportDialog open={showImportClients} onOpenChange={setShowImportClients} />
      <AddTaskDialog open={showAddTask} onOpenChange={setShowAddTask} clients={clients} />
      {settings.orderTrackingEnabled && (
        <AddOrderDialog open={showAddOrder} onOpenChange={setShowAddOrder} clients={clients} />
      )}
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        clients={clients}
        orders={orders}
        orderTrackingEnabled={settings.orderTrackingEnabled}
      />
      <FilterDialog
        open={showFilter}
        onOpenChange={setShowFilter}
        onFilter={filterClients}
        orderTrackingEnabled={settings.orderTrackingEnabled}
      />
    </div>
  )
}

export default function DashboardInner() {
  return (
    <SettingsProvider>
      <OrdersProvider>
        <TasksProvider>
          <ClientsProvider>
            <DashboardShell />
          </ClientsProvider>
        </TasksProvider>
      </OrdersProvider>
    </SettingsProvider>
  )
}
