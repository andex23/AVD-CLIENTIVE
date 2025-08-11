"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export type OAuthProvider = "google" | "github"

function getSiteUrl() {
  if (typeof window !== "undefined") return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || ""
}

/**
 * Starts an OAuth flow in a new tab (popup).
 * Throws an error with message starting "PROVIDER_NOT_ENABLED:" if the provider is disabled in Supabase.
 */
export async function startOAuth(provider: OAuthProvider) {
  const supabase = getSupabaseBrowserClient()

  const siteUrl = getSiteUrl()
  const redirectTo = `${siteUrl}/auth/callback`

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // We handle navigation ourselves to avoid iframe blocking.
        skipBrowserRedirect: true,
      },
    })

    if (error) throw error
    const url = data?.url
    if (!url) throw new Error("No OAuth URL returned")

    // Open in a new tab to avoid preview iframe blocking.
    const win = window.open(url, "_blank", "noopener,noreferrer")
    if (!win) {
      // Popup blocked; try to break out of iframes, then same window.
      try {
        if (window.top && window.top !== window) {
          window.top.location.assign(url)
          return
        }
      } catch {
        // ignore cross-origin error; fall back to same window
      }
      window.location.assign(url)
    }
  } catch (e: any) {
    const msg = (e?.message || "").toLowerCase()
    // Supabase returns: "Unsupported provider: provider is not enabled"
    if (msg.includes("provider is not enabled") || msg.includes("unsupported provider")) {
      const err = new Error(`PROVIDER_NOT_ENABLED:${provider}`)
      err.name = "ProviderNotEnabledError"
      throw err
    }
    throw e
  }
}
