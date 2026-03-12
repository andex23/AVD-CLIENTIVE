"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Loader2, UserPlus } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { startOAuth } from "@/lib/oauth"
import { toFriendlyError } from "@/lib/errors"

function getSiteOrigin() {
  if (typeof window !== "undefined") return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || ""
}

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${getSiteOrigin()}/auth/callback`,
        },
      })
      if (signUpErr) throw signUpErr

      localStorage.setItem("crm:userName", fullName)

      if (data.session) {
        router.push("/dashboard")
        return
      }

      setMessage("Account created. Check your inbox to confirm your email, then sign in.")
    } catch (err: any) {
      setError(toFriendlyError(err?.message || "Could not create account"))
    } finally {
      setLoading(false)
    }
  }

  async function onGoogleSignUp() {
    setError(null)
    setMessage(null)
    setOauthLoading(true)
    try {
      await startOAuth("google")
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg.startsWith("PROVIDER_NOT_ENABLED:")) {
        setError("Google sign-up is not enabled yet for this workspace.")
      } else {
        setError(toFriendlyError(msg || "Could not start Google sign-up"))
      }
    } finally {
      setOauthLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Start free"
      title="Create a cleaner operating rhythm for your client work."
      copy="Set up your workspace, keep the orange CLIENTIVE identity, and start with the exact client signals that matter."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-medium text-primary hover:text-primary/80">
            Sign in
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

        <Button type="button" variant="outline" className="w-full justify-between" onClick={onGoogleSignUp} disabled={oauthLoading}>
          Continue with Google
          {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Or create with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
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
              placeholder="Create a password"
              minLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full justify-between text-white" disabled={loading}>
            {loading ? (
              <>
                Creating account
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Create your workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="rounded-[22px] border border-border bg-[hsl(var(--surface-ivory))] p-4 text-sm leading-6 text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <UserPlus className="h-4 w-4 text-primary" />
            What you get immediately
          </div>
          A premium client workspace with follow-ups, notes, task visibility, quick actions, and optional order
          tracking without heavy CRM setup.
        </div>
      </div>
    </AuthShell>
  )
}
