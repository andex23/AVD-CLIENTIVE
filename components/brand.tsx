"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px]",
        className,
      )}
      aria-hidden="true"
    >
      <Image src="/brand/logo-mark.png" alt="" width={44} height={44} className="h-full w-full object-contain" priority />
    </span>
  )
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap font-mono text-base font-semibold uppercase leading-none tracking-[0.16em] text-foreground",
        className,
      )}
    >
      AVD-CLIENTIVE
    </span>
  )
}

export function BrandLockup({
  href = "/",
  className,
  label = "Go to homepage",
}: {
  href?: string
  className?: string
  label?: string
}) {
  return (
    <Link href={href} aria-label={label} className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <BrandWordmark />
    </Link>
  )
}
