"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"

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
      <AuthShell
        eyebrow="Auth callback"
        title="Completing your sign-in session."
        copy="We’re exchanging your secure provider callback for a CLIENTIVE session and preparing the workspace."
      >
        <Card className="surface-card border-border/70 bg-background/95">
          <CardContent className="flex items-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-foreground/80">Completing sign in and preparing your workspace…</p>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (error) {
    return (
      <AuthShell
        eyebrow="Auth callback"
        title="We couldn’t finish the provider sign-in."
        copy="The workspace is still intact. Retry the sign-in flow or head back to email/password access."
      >
        <Card className="surface-card border-border/70 bg-background/95">
          <CardContent className="space-y-5 p-8">
            <div className="flex items-start gap-3 rounded-[24px] border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <p className="text-sm leading-6 text-foreground/80">{error}</p>
            </div>
            <Button onClick={() => router.replace("/auth/sign-in")} className="w-full rounded-full">
              Return to sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return null
}
