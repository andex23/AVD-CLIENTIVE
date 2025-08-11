"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"

/**
 * Production fetch helper:
 * - Sends Authorization header when signed in
 * - No preview/draft fallbacks
 * - Throws on non-2xx with best-effort message
 */
export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const supabase = getSupabaseBrowserClient()
  const { data: sess } = await supabase.auth.getSession()
  const token = sess.session?.access_token

  const headers = new Headers(init?.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json")

  const res = await fetch(path, { ...init, headers, cache: "no-store" })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const data = await res.json()
      message = data?.error || message
    } catch {
      try {
        const text = await res.text()
        if (text) message = text
      } catch {
        // ignore
      }
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}
