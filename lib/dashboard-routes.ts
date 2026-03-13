export type DashboardSection = "today" | "clients" | "tasks" | "orders" | "settings"
export type DashboardWorkspaceSection = Exclude<DashboardSection, "settings">

export function getDashboardPath(section: DashboardSection, isPreview = false) {
  const pathname = section === "today" ? "/dashboard" : `/dashboard/${section}`
  return isPreview ? `${pathname}?preview=1` : pathname
}

export function getLegacyDashboardSection(value: string | null | undefined): DashboardWorkspaceSection {
  if (value === "clients" || value === "tasks" || value === "orders" || value === "today") return value
  return "today"
}
