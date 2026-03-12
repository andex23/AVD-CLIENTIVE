"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toFriendlyError } from "@/lib/errors"

function getSiteOrigin() {
  if (typeof window !== "undefined") return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || ""
}

export default function UpdatePasswordPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setHasRecoverySession(Boolean(data.session))
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function requestReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteOrigin()}/auth/update-password`,
      })
      if (error) throw error
      setMessage("Password reset link sent. Check your inbox and open the link on this device.")
    } catch (err: any) {
      setError(toFriendlyError(err?.message || "Could not send reset email"))
    } finally {
      setLoading(false)
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password.length < 8) {
      setError("Your new password should be at least 8 characters.")
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage("Password updated. You can now sign in with your new password.")
    } catch (err: any) {
      setError(toFriendlyError(err?.message || "Could not update password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Recovery"
      title={hasRecoverySession ? "Set a new password and get back to work." : "Recover access without losing momentum."}
      copy={
        hasRecoverySession
          ? "Choose a new password for your CLIENTIVE workspace and return to your client workflow."
          : "We’ll send a secure reset link so you can get back into your workspace without support intervention."
      }
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/auth/sign-in" className="font-medium text-primary hover:text-primary/80">
            Back to sign in
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
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {hasRecoverySession ? (
          <form className="space-y-5" onSubmit={updatePassword}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a new password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
              />
            </div>
            <Button type="submit" className="w-full justify-between text-white" disabled={loading}>
              {loading ? (
                <>
                  Updating password
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Save new password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={requestReset}>
            <div className="space-y-2">
              <Label htmlFor="email">Account email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full justify-between text-white" disabled={loading}>
              {loading ? (
                <>
                  Sending reset link
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Email me a reset link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-border bg-[hsl(var(--surface-ivory))] p-4 text-sm leading-6 text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Reset flow
            </div>
            Reset links are delivered to your inbox and return you to this screen to complete the password change.
          </div>
          <div className="rounded-[22px] border border-border bg-[hsl(var(--surface-ivory))] p-4 text-sm leading-6 text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Security
            </div>
            We keep recovery simple, but the password update still requires a valid recovery session from Supabase.
          </div>
        </div>

        <div className="rounded-[22px] border border-border bg-[hsl(var(--surface-ivory))] p-4 text-sm leading-6 text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <KeyRound className="h-4 w-4 text-primary" />
            Need another route?
          </div>
          If the reset link expires, just request a fresh one. If sign-in itself is failing, go back to the main sign-in page.
        </div>
      </div>
    </AuthShell>
  )
}
