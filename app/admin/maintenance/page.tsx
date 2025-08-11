"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminMaintenancePage() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function run(action: "backfill_unowned" | "purge_unowned") {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Request failed")
      setMessage(`${action} ok: clients=${data.counts?.clients ?? 0}, tasks=${data.counts?.tasks ?? 0}, orders=${data.counts?.orders ?? 0}`)
    } catch (e: any) {
      setError(e?.message || "Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Admin Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={() => run("backfill_unowned")} disabled={loading}>Backfill Unowned → Me</Button>
              <Button variant="destructive" onClick={() => run("purge_unowned")} disabled={loading}>Purge Unowned</Button>
            </div>
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-slate-600">
              Only admins can use this page. Configure admins via environment variables: <code>ADMIN_USER_IDS</code> and/or <code>ADMIN_EMAILS</code> (comma-separated).
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}


