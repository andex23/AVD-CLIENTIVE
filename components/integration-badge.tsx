"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function IntegrationBadge({
  ok,
  label,
  className,
}: {
  ok: boolean
  label: string
  className?: string
}) {
  return (
    <Badge
      variant={ok ? "default" : "destructive"}
      className={cn("gap-2", ok ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700", className)}
      aria-live="polite"
    >
      <span
        className={cn("inline-block h-2 w-2 rounded-full", ok ? "bg-white/90" : "bg-white/90")}
        aria-hidden="true"
      />
      {label}
    </Badge>
  )
}
