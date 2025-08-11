import type React from "react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4 font-mono">
          {/* Left: AVD logo in orange circle */}
          <Link href="/" aria-label="AVD Clientive Home" className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F35A1F] text-[11px] font-bold leading-none text-white"
              aria-hidden="true"
              title="AVD"
            >
              AVD
            </span>
          </Link>

          {/* Center: Links with dot separators */}
          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300"
          >
            <FooterLink href="/">Home</FooterLink>
            <SeparatorDot />
            <FooterLink href="/features">Features</FooterLink>
            <SeparatorDot />
            <FooterLink href="/support">Support</FooterLink>
          </nav>

          {/* Right: Copyright */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{"© 2025 AVD Clientive"}</div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link href={props.href} className="transition-colors hover:underline underline-offset-4 decoration-neutral-400/60">
      {props.children}
    </Link>
  )
}

function SeparatorDot() {
  return (
    <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-500">
      {"•"}
    </span>
  )
}
