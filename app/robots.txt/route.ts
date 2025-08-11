function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl.replace(/\/+$/, "")
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

export async function GET(req: Request) {
  const base = getBaseUrl(req)
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${base}/sitemap.xml`].join("\n")

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
