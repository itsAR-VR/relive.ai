"use client"

import Link from "next/link"
import { Gift } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthUser } from "./use-auth-user"

export function LandingHeader() {
  const { user, isLoading } = useAuthUser()

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="bg-primary text-primary-foreground text-center text-xs sm:text-sm font-semibold px-3 py-2">
        50% off Black Friday
      </div>
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md group-hover:shadow-lg transition-shadow">
            <Gift className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg text-foreground">Moments</p>
            <p className="text-xs text-muted-foreground">Memory Restoration Studio</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/pricing"
            className="hidden sm:block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Packages
          </Link>

          {isLoading ? (
            <div
              className="h-10 w-[118px] animate-pulse rounded-md border border-border bg-muted"
              aria-label="Loading navigation"
            />
          ) : user ? (
            <Button
              asChild
              className="bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
