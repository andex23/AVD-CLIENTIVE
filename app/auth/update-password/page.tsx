"use client"

import type React from "react"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient, isBrowserAuthConfigured } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const configured = isBrowserAuthConfigured()
  const { toast } = useToast()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const exchanged = useRef(false)

  useEffect(() => {
    if (!configured) {
      // In preview/no-auth mode, show a hint and allow navigating to dashboard
      setReady(true)
      return
    }

    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const code = params.get("code")
        if (code && !exchanged.current) {
          exchanged.current = true
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setError("This reset link is invalid or has expired. Request a new one from the Sign In page.")
          }
        }
        setReady(true)
      } catch {
        setError("Something went wrong while verifying your reset link.")
        setReady(true)
      }
    }
    run()
  }, [params, configured])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!configured) {
      toast({ description: "Auth isn’t configured. Opening preview dashboard." })
      router.push("/dashboard?preview=1")
      return
    }
    if (!password || password.length < 8) {
      setError("Please enter a password with at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast({ description: "Password updated successfully. Please sign in again." })
      router.replace("/auth/sign-in")
    } catch (err: any) {
      setError(err?.message || "Unable to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-md px-4 py-10 md:py-16">
        <Card className="rounded-2xl md:rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="px-6 md:px-10 py-8 md:py-10">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full ring-2 ring-orange-500 grid place-items-center">
                <img src="/brand/logo-mark.png" alt="AVD Clientive" className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Update your password
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Set a new password to secure your account.</p>
            </div>

            {!configured && (
              <Alert className="mt-6">
                <AlertDescription>
                  Supabase isn’t configured. You can still explore the app in preview.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mt-6" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="mt-8 space-y-5" aria-busy={loading}>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={!ready || loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  disabled={!ready || loading}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading || !ready}
                >
                  {loading ? "Updating..." : "Update password"}
                </Button>
                <Button type="button" variant="outline" className="w-full h-11 bg-transparent" asChild>
                  <Link href="/auth/sign-in">Back to Sign In</Link>
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
      <img src="/images/auth-reference.png" alt="" className="hidden" aria-hidden="true" />
    </div>
  )
}
