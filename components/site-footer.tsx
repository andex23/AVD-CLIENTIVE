import Link from "next/link"
import { BrandLockup } from "@/components/brand"

const footerNav = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Demo" },
  { href: "/support", label: "Support" },
  { href: "/auth/sign-in", label: "Log in" },
]

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-[linear-gradient(180deg,hsl(var(--surface-soft)),hsl(var(--surface-ivory)))]">
      <div className="section-wrap py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <BrandLockup />
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              CLIENTIVE keeps client notes, next actions, and optional orders in one calm workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {footerNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          © 2026 CLIENTIVE
        </div>
      </div>
    </footer>
  )
}
