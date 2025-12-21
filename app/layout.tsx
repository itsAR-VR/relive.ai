import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"

import "./globals.css"

import { Playfair_Display, Inter } from 'next/font/google'
import { HashAuthListener } from "@/components/hash-auth-listener"

// Serif font for headings - high-end, story-driven feel
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif",
})

// Sans-serif font for body text - clean readability
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Moments — Give the Gift of a Relived Memory",
  description:
    "The hardest person to buy for has everything they need. Except their childhood. Tell us your story, and our directors will bring the memory back to life.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "48x48",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#3d3632",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const analyticsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true" ||
    Boolean(process.env.VERCEL_ANALYTICS_ID)

  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" />
        <link
          rel="preconnect"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com"
          crossOrigin="anonymous"
        />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '701101296028383');
fbq('track', 'PageView');
          `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=701101296028383&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <HashAuthListener />
        {analyticsEnabled ? <Analytics /> : null}
        <SpeedInsights />
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  )
}
