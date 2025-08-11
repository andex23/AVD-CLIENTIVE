"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader as UISheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between font-mono">
        <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
          <img src="/brand/logo-mark.png" alt="AVD Clientive logo" className="h-8 w-8" />
          <span className="font-semibold text-xl text-slate-900">CLIENTIVE</span>
        </Link>

        <nav aria-label="Main" className="hidden md:flex items-center gap-6 text-slate-700">
          <Link href="/features" className="hover:text-slate-900">
            Features
          </Link>
          <Link href="/support" className="hover:text-slate-900">
            Support
          </Link>
          <Link href="/auth/sign-in" className="inline-flex">
            <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent">
              Login
            </Button>
          </Link>
        </nav>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <UISheetHeader>
              <SheetTitle className="font-mono">Menu</SheetTitle>
            </UISheetHeader>
            <div className="mt-6 grid gap-3">
              <Link href="/features" className="text-slate-900 hover:underline" onClick={() => setOpen(false)}>
                Features
              </Link>
              <Link href="/support" className="text-slate-900 hover:underline" onClick={() => setOpen(false)}>
                Support
              </Link>
              <Link href="/auth/sign-in" onClick={() => setOpen(false)} className="inline-flex">
                <Button className="w-full h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">Login</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
