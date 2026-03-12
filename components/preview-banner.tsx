"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PreviewBanner() {
  const params = useSearchParams()
  const router = useRouter()
  const isPreview = useMemo(() => params.get("preview") === "1", [params])

  if (!isPreview) return null

  return (
    <div className="w-full border-b border-border bg-[hsl(var(--surface-soft))/0.88]">
      <div className="page-shell flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-xs text-muted-foreground sm:items-center">
          <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:mt-0" />
          <p className="leading-5">
            <span className="font-medium text-foreground">Preview mode.</span> Sample records only.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-[10px] border border-border/70 px-3 text-xs"
          onClick={() => router.replace("/dashboard")}
        >
          <XCircle className="h-3.5 w-3.5" />
          Exit preview
        </Button>
      </div>
    </div>
  )
}

export default PreviewBanner
