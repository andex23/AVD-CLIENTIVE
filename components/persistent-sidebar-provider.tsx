"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null
  return null
}

export function PersistentSidebarProvider({
  children,
  defaultOpenFallback = true,
}: {
  children: React.ReactNode
  defaultOpenFallback?: boolean
}) {
  const [open, setOpen] = React.useState<boolean>(defaultOpenFallback)

  React.useEffect(() => {
    const raw = getCookie("sidebar:state")
    if (raw === "true") setOpen(true)
    else if (raw === "false") setOpen(false)
  }, [])

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {children}
    </SidebarProvider>
  )
}
