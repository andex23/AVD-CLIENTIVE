import { redirect } from "next/navigation"
import { DashboardWorkspaceRoute } from "@/components/dashboard-workspace"
import { getDashboardPath, getLegacyDashboardSection } from "@/lib/dashboard-routes"

type DashboardPageProps = {
  searchParams: Promise<{
    preview?: string
    tab?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const active = getLegacyDashboardSection(params.tab)
  const isPreview = params.preview === "1"

  if (active !== "today") {
    redirect(getDashboardPath(active, isPreview))
  }

  return <DashboardWorkspaceRoute active="today" />
}
