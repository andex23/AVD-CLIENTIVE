function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl.replace(/\/+$/, "")
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

const ROUTES: Array<{ path: string; priority?: number; changefreq?: string }> = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/features", priority: 0.8, changefreq: "monthly" },
  { path: "/support", priority: 0.6, changefreq: "monthly" },
  { path: "/auth/sign-in", priority: 0.4, changefreq: "yearly" },
  { path: "/auth/sign-up", priority: 0.4, changefreq: "yearly" },
]

export async function GET(req: Request) {
  const base = getBaseUrl(req)
  const now = new Date().toISOString()

  const urls = ROUTES.map((r) => {
    const loc = `${base}${r.path}`
    const priority = r.priority ?? 0.5
    const changefreq = r.changefreq ?? "monthly"
    return `<url>
  <loc>${loc}</loc>
  <lastmod>${now}</lastmod>
  <changefreq>${changefreq}</changefreq>
  <priority>${priority.toFixed(1)}</priority>
</url>`
  }).join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
