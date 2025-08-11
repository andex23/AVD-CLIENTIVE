"use client"

import type * as React from "react"
import { LayoutDashboard, Users, ClipboardList, Package, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type NavKey = "overview" | "clients" | "tasks" | "orders" | "settings"

const NAV_ITEMS: Array<{
  key: NavKey
  title: string
  icon: React.ComponentType<{ className?: string }>
  tooltip?: string
}> = [
  { key: "overview", title: "Overview", icon: LayoutDashboard, tooltip: "Overview" },
  { key: "clients", title: "Clients", icon: Users, tooltip: "Clients" },
  { key: "tasks", title: "Tasks & Follow-ups", icon: ClipboardList, tooltip: "Tasks" },
  { key: "orders", title: "Orders", icon: Package, tooltip: "Orders" },
  { key: "settings", title: "Settings", icon: Settings, tooltip: "Settings" },
]

export function AppSidebar({
  active = "clients",
  onNavigate,
  ...props
}: {
  active?: NavKey
  onNavigate?: (key: NavKey) => void
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar side="left" collapsible="icon" {...props}>
      <SidebarHeader className="px-2">
        <SidebarInput placeholder="Search..." aria-label="Sidebar quick search" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Primary">
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.key
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.tooltip}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => onNavigate?.(item.key)}
                          className="flex items-center gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-xs text-muted-foreground px-2 pb-2">
        <div aria-hidden="true">Press Ctrl/Cmd + B to toggle</div>
      </SidebarFooter>
      {/* Rail enables click-to-collapse/expand on desktop */}
      <SidebarRail />
    </Sidebar>
  )
}
