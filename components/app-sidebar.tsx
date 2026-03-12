"use client"

import type * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Home, ListTodo, Settings2, Sparkles, Users, Package2 } from "lucide-react"
import { BrandMark, BrandWordmark } from "@/components/brand"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export type AppNavKey = "today" | "clients" | "tasks" | "orders" | "settings"

const NAV_ITEMS: Array<{
  key: AppNavKey
  title: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "today", title: "Today", icon: Sparkles },
  { key: "clients", title: "Clients", icon: Users },
  { key: "tasks", title: "Tasks", icon: ListTodo },
  { key: "orders", title: "Orders", icon: Package2 },
  { key: "settings", title: "Settings", icon: Settings2 },
]

export function AppSidebar({
  active = "today",
  onNavigate,
  ...props
}: {
  active?: AppNavKey
  onNavigate?: (key: AppNavKey) => void
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar side="left" variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="gap-3 px-2.5 py-3.5">
        <Link href="/" className="flex items-center gap-3 px-1 py-1 transition-colors hover:text-sidebar-foreground">
          <BrandMark className="h-9 w-9 shrink-0 rounded-[14px]" />
          <BrandWordmark className="min-w-0 text-sm tracking-[0.18em] text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
                        tooltip={item.title}
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
      <SidebarFooter className="px-2.5 pb-3.5">
        <div className="border-t border-sidebar-border/80 pt-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/42">Public pages</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-[11px] font-semibold text-sidebar-foreground"
            >
              Open demo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-semibold text-sidebar-foreground/68"
            >
              Home
              <Home className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="px-1 pt-1 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/35 group-data-[collapsible=icon]:hidden">
          Press Ctrl/Cmd + B to toggle
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
