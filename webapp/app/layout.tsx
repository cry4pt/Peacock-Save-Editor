// Root layout component - defines the global HTML structure and metadata
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { RegisterServiceWorker } from "./register-sw"
import "./globals.css"

// Load Google fonts for the application with optimized display strategy
const _geist = Geist({ subsets: ["latin"], display: "swap" })
const _geistMono = Geist_Mono({ subsets: ["latin"], display: "swap" })

// Metadata for SEO and browser display
export const metadata: Metadata = {
  title: "Peacock Save Editor",
  description: "Modern save editor for Peacock - Hitman World of Assassination",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      // Light theme icon
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      // Dark theme icon
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      // SVG icon fallback
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Peacock Editor",
  },
}

// Viewport settings for responsive design
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

// Root layout wrapper for all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Set dark mode by default
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {/* Register service worker for PWA support */}
        <RegisterServiceWorker />
        {/* Page content */}
        {children}
        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  )
}
