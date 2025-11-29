"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuthUser } from "./use-auth-user"

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Sale ends Tuesday December 2nd, 2025 at 12:00 AM EST (05:00 UTC)
    const saleEndDate = new Date('2025-12-02T05:00:00Z')
    
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = saleEndDate.getTime() - now.getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (num: number) => num.toString().padStart(2, '0')

  return (
    <span className="font-mono tabular-nums">
      {timeLeft.days > 0 && `${timeLeft.days}:`}{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  )
}

export function LandingHeader() {
  const { user, isLoading } = useAuthUser()

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="bg-primary text-primary-foreground text-center text-xs sm:text-sm px-3 py-2.5 flex items-center justify-center gap-3 sm:gap-6">
        <span className="font-medium">BLACK FRIDAY is finally here. Get up to 67% off sitewide!</span>
        <CountdownTimer />
        <Link 
          href="/pricing" 
          className="hidden sm:inline-flex items-center px-3 py-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/30 rounded text-xs font-medium uppercase tracking-wide transition-colors"
        >
          Learn More
        </Link>
      </div>
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/gifting-moments-logo.svg"
            alt="Gifting Moments"
            width={140}
            height={50}
            className="h-12 w-auto dark:invert"
            priority
          />
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
