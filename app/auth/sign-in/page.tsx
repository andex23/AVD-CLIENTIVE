"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        if (String(signInErr.message || "").toLowerCase().includes("confirm")) {
          setError(null)
          // Offer resend flow
          const { error: resendErr } = await supabase.auth.resend({ type: "signup", email })
          if (resendErr) throw resendErr
          setError("Email not confirmed. We’ve resent the confirmation email.")
          return
        }
        throw signInErr
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-md px-4 py-10 md:py-16">
        <Card className="rounded-2xl md:rounded-3xl border-slate-200 shadow-sm">
          <div className="px-6 md:px-10 py-8 md:py-10">
            <div className="flex flex-col items-center text-center">
              <Link
                href="/"
                aria-label="Go to homepage"
                className="inline-block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span className="sr-only">AVD Clientive</span>
                <div className="h-16 w-16 rounded-full ring-2 ring-orange-500 grid place-items-center transition-colors hover:ring-orange-600">
                  <img src="/brand/logo-mark.png" alt="AVD Clientive" className="h-10 w-10" />
                </div>
              </Link>
              <h1 className="mt-6 text-2xl md:text-3xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-2 text-slate-600">Sign in to continue</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>

              <div className="mt-2 text-center">
                <Link href="/auth/update-password" className="text-sm text-orange-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <p className="text-sm text-slate-600 text-center mt-4">
                New here?{" "}
                <Link href="/auth/sign-up" className="text-orange-600 hover:underline">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
