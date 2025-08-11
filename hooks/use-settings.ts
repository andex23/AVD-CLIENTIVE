"use client"

import * as React from "react"

type Settings = {
  orderTrackingEnabled: boolean
  // New: global preference for receiving email notifications for tasks
  emailNotificationsEnabled: boolean
}

type SettingsContextValue = {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  orderTrackingEnabled: false,
  emailNotificationsEnabled: false,
}

const STORAGE_KEY = "crm:settings"

const SettingsContext = React.createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(defaultSettings)

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore
    }
  }, [])

  const updateSettings = React.useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const value = { settings, updateSettings }
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider")
  return ctx
}
