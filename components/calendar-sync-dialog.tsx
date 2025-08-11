"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, CalendarIcon as Cal, CheckCircle2, ExternalLink } from "lucide-react"

interface CalendarSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasksCount: number
}

/**
 * Shows a subscription URL for the live ICS feed and helpers
 * to export or open Google Calendar's "Add by URL" flow.
 */
export function CalendarSyncDialog({ open, onOpenChange, tasksCount }: CalendarSyncDialogProps) {
  const [copied, setCopied] = useState(false)
  const origin =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const feedUrl = useMemo(() => `${origin}/api/calendar`, [origin])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const openGoogleAddByUrl = () => {
    // Google doesn't allow prefilled feed url, but opens the UI for "From URL"
    window.open("https://calendar.google.com/calendar/u/0/r/settings/addbyurl", "_blank", "noopener,noreferrer")
  }

  const openOutlookHelp = () => {
    window.open(
      "https://support.microsoft.com/office/import-or-subscribe-to-a-calendar-in-outlook-on-the-web-503ffaf6-7b86-44fe-8dd6-8099d95f38df",
      "_blank",
      "noopener,noreferrer",
    )
  }

  const openAppleHelp = () => {
    window.open(
      "https://support.apple.com/guide/calendar/subscribe-to-calendars-icl1023/mac",
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cal className="h-5 w-5" />
            Calendar Sync
          </DialogTitle>
          <DialogDescription>Subscribe to a live feed of your tasks in your calendar app.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>ICS Feed URL</Label>
            <div className="mt-2 flex gap-2">
              <Input value={feedUrl} readOnly />
              <Button type="button" variant="outline" onClick={copy}>
                {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Subscribe in Google Calendar (Settings → Add calendar → From URL), Apple Calendar (File → New Calendar
              Subscription), or Outlook (Subscribe from web).
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="outline" onClick={openGoogleAddByUrl}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Calendar
            </Button>
            <Button variant="outline" onClick={openAppleHelp}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Apple Calendar
            </Button>
            <Button variant="outline" onClick={openOutlookHelp}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Outlook
            </Button>
          </div>

          <div className="rounded-md border p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              The feed currently includes {tasksCount} tasks. New tasks will appear in your calendar automatically after
              subscription (sync frequency depends on your calendar provider).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
