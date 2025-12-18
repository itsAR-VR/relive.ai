"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, type FormEvent } from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FooterProps {
  variant?: "default" | "minimal"
}

export function Footer({ variant = "default" }: FooterProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus("loading")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || "Failed to subscribe. Please try again.")
      }

      setStatus("success")
    } catch (err) {
      setStatus("idle")
      setError(err instanceof Error ? err.message : "Failed to subscribe. Please try again.")
    }
  }

  if (variant === "minimal") {
    return (
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gifting Moments
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-border bg-muted/30 py-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {/* Brand */}
          <div>
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={220}
              height={75}
              className="h-16 md:h-20 w-auto"
            />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
              The easiest way to give the most emotional gift they’ve ever received — delivered in 24 hours with
              unlimited revisions.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-foreground">Links</p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Packages
              </Link>
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="/examples" className="hover:text-foreground transition-colors">
                Examples
              </Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign in
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div id="newsletter">
            <p className="text-sm font-semibold text-foreground">Newsletter</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Get ideas for emotional gifts and reminders before big dates.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-4 flex gap-2">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setStatus("idle")
                    setError(null)
                  }}
                  placeholder="you@example.com"
                  className="w-full h-10 rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <Button type="submit" disabled={status === "loading"} className="h-10 px-4">
                {status === "loading" ? "Joining…" : "Join"}
              </Button>
            </form>

            {status === "success" ? (
              <p className="mt-2 text-xs text-green-700">You’re in. We’ll send occasional gift ideas and reminders.</p>
            ) : null}
            {error ? (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gifting Moments
          </p>
        </div>
      </div>
    </footer>
  )
}
