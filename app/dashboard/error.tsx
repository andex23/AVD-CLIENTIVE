"use client"

import { useMemo } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

function messageFor(error: Error) {
  const msg = error?.message || ""
  if (msg.includes("ChunkLoadError") || msg.includes("Loading chunk")) {
    return "The dashboard bundle took too long to load. It’s likely a temporary network issue."
  }
  return "The dashboard ran into a problem."
}

export default function DashboardError({ error, reset }: Props) {
  const summary = useMemo(() => messageFor(error), [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4">
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            <span>Dashboard Error</span>
            {error?.digest && <Badge variant="secondary">Digest: {error.digest}</Badge>}
          </AlertTitle>
          <AlertDescription>{summary}</AlertDescription>
        </Alert>

        <div className="rounded-md border p-4 bg-muted/30 space-y-3">
          <p className="text-sm text-muted-foreground">
            You can try the following:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Click “Retry” to attempt loading the dashboard again.</li>
            <li>Refresh the page if the issue persists.</li>
            <li>If you’re using the demo, you can also open /dashboard?preview=1 to bypass auth.</li>
          </ul>
          <div className="flex gap-2">
            <Button onClick={reset}>Retry</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh page</Button>
          </div>
        </div>

        <details className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
          <summary className="cursor-pointer">Technical details</summary>
          {error?.name ? `Name: ${error.name}\n` : ""}
          {error?.message ? `Message: ${error.message}\n` : ""}
          {error?.stack ? `Stack:\n${error.stack}` : ""}
        </details>
      </div>
    </div>
  )
}
