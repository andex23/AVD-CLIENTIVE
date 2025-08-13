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

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
    try {
      const supabase = getSupabaseBrowserClient()

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (signUpError) throw signUpError

      // If email confirmation is required, inform user and provide resend
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        setInfo("Account created. Check your email to confirm your address, then sign in.")
        return
      }

      try {
        if (fullName.trim()) localStorage.setItem("crm:userName", fullName.trim())
      } catch {
        // ignore localStorage errors
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Sign up failed")
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
              <h1 className="mt-6 text-2xl md:text-3xl font-bold text-slate-900">Create your AVD Clientive account</h1>
              <p className="mt-2 text-slate-600">Start organizing clients, orders, and follow-ups</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert className="mt-6">
                <AlertDescription>
                  {info}
                  <br />
                  Didn’t get an email? <button
                    type="button"
                    onClick={async () => {
                      try {
                        const supabase = getSupabaseBrowserClient()
                        const { error } = await supabase.auth.resend({ type: "signup", email })
                        if (error) throw error
                        setInfo("Confirmation email resent. Please check your inbox.")
                      } catch (e: any) {
                        setError(e?.message || "Could not resend confirmation")
                      }
                    }}
                    className="underline text-orange-600"
                  >Resend email</button>
                </AlertDescription>
              </Alert>
            )}

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
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
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-invalid={passwordsMismatch ? "true" : "false"}
                  aria-describedby={passwordsMismatch ? "confirm-password-error" : undefined}
                />
                {passwordsMismatch && (
                  <p id="confirm-password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
                    {"Passwords do not match."}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={loading || passwordsMismatch}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>

              <p className="text-sm text-slate-600 text-center">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-orange-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
