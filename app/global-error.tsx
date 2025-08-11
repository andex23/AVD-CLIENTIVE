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
    return "We couldn't load part of the app in time. This is usually a temporary network issue."
  }
  if (msg.includes("MonacoEnvironment.getWorker")) {
    return "An editor worker failed to start in the preview host. This does not affect core CRM features."
  }
  return "Something went wrong."
}

export default function GlobalError({ error, reset }: Props) {
  const summary = useMemo(() => messageFor(error), [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-lg space-y-4">
            <Alert variant="destructive">
              <AlertTitle className="flex items-center gap-2">
                <span>Unexpected Error</span>
                {error?.digest && <Badge variant="secondary">Digest: {error.digest}</Badge>}
              </AlertTitle>
              <AlertDescription>{summary}</AlertDescription>
            </Alert>

            <div className="rounded-md border p-4 bg-muted/30 space-y-3">
              <p className="text-sm text-muted-foreground">
                Try these quick fixes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Click “Try again” to reload the affected parts.</li>
                <li>Check your connection and temporarily disable ad/privacy blockers for the preview URL.</li>
                <li>If you see “Loading chunk failed”, try refreshing the page once.</li>
              </ul>
              <div className="flex gap-2">
                <Button onClick={reset}>Try again</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>Full refresh</Button>
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
      </body>
    </html>
  )
}
