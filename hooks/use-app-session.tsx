"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type AppSessionState = {
  loading: boolean
  userName: string
  userEmail: string
}

const DEFAULT_USER = "Owner"

function readStoredName() {
  try {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("crm:userName") || ""
  } catch {
    return ""
  }
}

export function useAppSession() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get("preview") === "1"
  const [state, setState] = React.useState<AppSessionState>({
    loading: !isPreview,
    userName: readStoredName() || (isPreview ? "Preview workspace" : DEFAULT_USER),
    userEmail: "",
  })

  React.useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (isPreview) {
        if (!isMounted) return
        setState({
          loading: false,
          userName: readStoredName() || "Preview workspace",
          userEmail: "",
        })
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
          if (!isMounted) return
          setState((current) => ({ ...current, loading: false }))
          router.replace("/auth/sign-in")
          return
        }

        const meta = data.user.user_metadata || {}
        const storedName = readStoredName()
        const fullName = String(meta.full_name || meta.name || storedName || data.user.email?.split("@")[0] || DEFAULT_USER)

        try {
          localStorage.setItem("crm:userName", fullName)
        } catch {
          // ignore localStorage failures
        }

        if (!isMounted) return
        setState({
          loading: false,
          userName: fullName,
          userEmail: data.user.email || "",
        })
      } catch {
        if (!isMounted) return
        setState((current) => ({ ...current, loading: false }))
        router.replace("/auth/sign-in")
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [isPreview, router])

  const signOut = React.useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
    } catch {
      // ignore auth sign-out failures and clear the local session label anyway
    } finally {
      try {
        localStorage.removeItem("crm:userName")
      } catch {
        // ignore localStorage failures
      }
      router.replace("/auth/sign-in")
    }
  }, [router])

  return {
    ...state,
    isPreview,
    signOut,
  }
}
