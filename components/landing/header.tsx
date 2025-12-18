"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthUser } from "./use-auth-user"

export function LandingHeader() {
  const { user, isLoading } = useAuthUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="bg-primary text-primary-foreground px-3 py-2.5">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 text-center">
          <p className="text-xs sm:text-sm font-medium">
            🎁 HOLIDAY OFFER: Up to 67% off their first film — delivered in 24 hours
          </p>
          <p className="hidden sm:block text-xs text-primary-foreground/90">
            Unlimited revisions included.
          </p>
          <Link
            href="/pricing"
            className="mt-1 sm:mt-0 inline-flex items-center px-3 py-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/30 rounded text-[11px] sm:text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            See packages
          </Link>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-3 items-center px-4 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/gifting-moments-logo.svg"
            alt="Gifting Moments"
            width={240}
            height={80}
            className="h-16 md:h-20 w-auto dark:invert"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-2">
          <Link
            href="/how-it-works"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Packages
          </Link>
          <Link
            href="/examples"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Examples
          </Link>
          <Link
            href="/faq"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/?quiz=1">Create Their Gift</Link>
          </Button>

          {isLoading ? (
            <div
              className="hidden sm:block h-10 w-[88px] animate-pulse rounded-md border border-border bg-muted"
              aria-label="Loading navigation"
            />
          ) : (
            <Link
              href={user ? "/dashboard" : "/login"}
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              href="/how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Packages
            </Link>
            <Link
              href="/examples"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Examples
            </Link>
            <Link
              href="/faq"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              FAQ
            </Link>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {user ? "Dashboard" : "Sign in"}
              </Link>
              <Link
                href="/support"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
