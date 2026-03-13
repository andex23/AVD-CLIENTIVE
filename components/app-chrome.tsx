"use client"

import type * as React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar, type AppNavKey } from "@/components/app-sidebar"
import { PreviewBanner } from "@/components/preview-banner"
import { cn } from "@/lib/utils"

type AppChromeProps = {
  active: AppNavKey
  onNavigate: (key: AppNavKey) => void
  sectionLabel: string
  title: string
  description: string
  userName: string
  userEmail?: string
  isPreview?: boolean
  status?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}

export function AppChrome({
  active,
  onNavigate,
  sectionLabel,
  title,
  description,
  userName,
  userEmail,
  isPreview,
  status,
  actions,
  children,
}: AppChromeProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar active={active} onNavigate={onNavigate} />
      <SidebarInset className="bg-[linear-gradient(180deg,rgba(255,250,245,1),rgba(246,239,230,0.98))]">
        <PreviewBanner />
        <header className="border-b border-border bg-[hsl(var(--surface-ivory))/0.96]">
          <div className="page-shell py-5 md:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex items-start gap-3.5">
                <SidebarTrigger className="mt-0.5 h-9 w-9 rounded-[12px] border border-border/80 bg-background/94 text-foreground shadow-none hover:bg-background" />
                <div className="min-w-0 space-y-2.5">
                  <span className="section-label m-0">{sectionLabel}</span>
                  <div className="space-y-1.5">
                    <h1 className="font-sans text-[1.9rem] font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-[2.2rem]">
                      {title}
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 xl:items-end">
                {status ? (
                  <div className="w-full text-sm text-muted-foreground xl:max-w-[360px] xl:text-right">{status}</div>
                ) : null}
                {actions ? (
                  <div className={cn("flex w-full flex-wrap gap-2 xl:justify-end")}>{actions}</div>
                ) : null}
              </div>
            </div>
          </div>
        </header>
        <div className="page-shell flex-1 py-6 md:py-7">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
