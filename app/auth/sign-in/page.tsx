"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Loader2, Mail } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toFriendlyError } from "@/lib/errors"
import { startOAuth } from "@/lib/oauth"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        if (String(signInErr.message || "").toLowerCase().includes("confirm")) {
          const { error: resendErr } = await supabase.auth.resend({ type: "signup", email })
          if (resendErr) throw resendErr
          setError("Email not confirmed yet. We just sent another confirmation email.")
          return
        }
        throw signInErr
      }

      const fullName =
        data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || data.user?.email?.split("@")[0]
      if (fullName) {
        localStorage.setItem("crm:userName", String(fullName))
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(toFriendlyError(err?.message || "Sign in failed"))
    } finally {
      setLoading(false)
    }
  }

  async function onGoogleSignIn() {
    setError(null)
    setOauthLoading(true)
    try {
      await startOAuth("google")
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg.startsWith("PROVIDER_NOT_ENABLED:")) {
        setError("Google sign-in is not enabled yet for this workspace.")
      } else {
        setError(toFriendlyError(msg || "Could not start Google sign-in"))
      }
    } finally {
      setOauthLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Pick up the day with the full client picture already in view."
      copy="Return to your client workspace, clear the next follow-ups, and keep momentum without rebuilding context."
      footer={
        <p className="text-sm text-muted-foreground">
          New to CLIENTIVE?{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:text-primary/80">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="button" variant="outline" className="w-full justify-between" onClick={onGoogleSignIn} disabled={oauthLoading}>
          Continue with Google
          {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <Link href="/auth/update-password" className="font-medium text-primary hover:text-primary/80">
              Forgot password?
            </Link>
            <Link href="/demo" className="text-muted-foreground hover:text-foreground">
              See demo first
            </Link>
          </div>

          <Button type="submit" className="w-full justify-between text-white" disabled={loading}>
            {loading ? (
              <>
                Signing in
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Sign in to CLIENTIVE
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="rounded-[22px] border border-border bg-[hsl(var(--surface-ivory))] p-4 text-sm leading-6 text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Mail className="h-4 w-4 text-primary" />
            Sign-in note
          </div>
          If your account needs email confirmation, sign in once and we will offer to resend the confirmation link.
        </div>
      </div>
    </AuthShell>
  )
}
