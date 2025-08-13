"use client"

export default function DebugEnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    <main className="min-h-screen p-6 font-mono">
      <h1 className="text-xl mb-4">Debug Env (Client)</h1>
      <div className="space-y-2 text-sm">
        <div>
          NEXT_PUBLIC_SUPABASE_URL: {url ? `${url.slice(0, 24)}…` : "(missing)"}
        </div>
        <div>
          NEXT_PUBLIC_SUPABASE_ANON_KEY: {anon ? `present (${anon.length} chars)` : "(missing)"}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">Remove this page after verifying.</p>
    </main>
  )
}


