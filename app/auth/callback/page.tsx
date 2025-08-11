"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        // Exchange the OAuth code in the URL for a session.
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (error) throw error
        router.replace("/dashboard")
      } catch (e: any) {
        setError(e?.message || "Could not complete sign in.")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
            <p className="text-slate-700">Completing sign in…</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <Card className="p-8 space-y-4 max-w-md">
          <p className="text-red-600">{error}</p>
          <div className="flex justify-end">
            <Button onClick={() => router.replace("/auth/sign-in")} className="bg-orange-600 hover:bg-orange-700">
              Go back to sign in
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return null
}
