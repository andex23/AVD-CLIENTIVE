import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Fraunces } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://avd-clientive.vercel.app"),
  title: {
    default: "CLIENTIVE | Stay close to every client without a bloated CRM",
    template: "%s | CLIENTIVE",
  },
  description:
    "CLIENTIVE is a premium CRM for solo service owners who need client context, disciplined follow-ups, and clean order tracking without enterprise clutter.",
  applicationName: "CLIENTIVE",
  keywords: [
    "CLIENTIVE",
    "CRM for freelancers",
    "CRM for consultants",
    "client follow-up software",
    "solo business CRM",
    "lightweight CRM",
  ],
  openGraph: {
    title: "CLIENTIVE",
    description: "Stay close to every client without a bloated CRM.",
    url: "/",
    siteName: "CLIENTIVE",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLIENTIVE",
    description: "Stay close to every client without a bloated CRM.",
  },
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-display: ${fraunces.style.fontFamily};
}
        `}</style>
      </head>
      <body className={fraunces.variable}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
