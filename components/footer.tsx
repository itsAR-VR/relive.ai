import Link from "next/link"
import Image from "next/image"

interface FooterProps {
  variant?: "default" | "minimal"
}

export function Footer({ variant = "default" }: FooterProps) {
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
    <footer className="border-t border-border bg-muted/30 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center">
            <Image
              src="/gifting-moments-logo.svg"
              alt="Gifting Moments"
              width={220}
              height={75}
              className="h-16 md:h-20 w-auto"
            />
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Packages
            </Link>
            <Link href="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gifting Moments
          </p>
        </div>
      </div>
    </footer>
  )
}
