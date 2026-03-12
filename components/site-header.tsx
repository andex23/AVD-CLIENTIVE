"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { BrandLockup } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const NAV_ITEMS = [
  { href: "/demo", label: "Demo" },
  { href: "/support", label: "Support" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95">
      <div className="section-wrap flex items-center justify-between gap-6 py-4">
        <BrandLockup />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/sign-in">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/sign-up">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 border-l border-border bg-background">
            <UISheetHeader>
              <SheetTitle className="text-left font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Navigate CLIENTIVE
              </SheetTitle>
            </UISheetHeader>

            <div className="mt-8 grid gap-1.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-border py-3 text-base font-medium text-foreground last:border-b-0"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-3">
              <Button variant="outline" className="justify-between" asChild>
                <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                  Log in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button className="justify-between" asChild>
                <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
