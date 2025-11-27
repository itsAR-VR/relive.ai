"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useAuthUser } from "./use-auth-user"

export function LandingHeader() {
  const { user, isLoading } = useAuthUser()

  return (
    <header className="sticky top-0 z-30 border-b border-[#d4c9b8]/80 bg-[#f5f1e6]/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3d3632] text-[#f5f1e6] shadow-md shadow-black/10">
            <span className="text-lg font-semibold leading-none">R</span>
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg text-[#3d3632]">Relive</p>
            <p className="text-xs text-[#6b5e54]">Memories in motion</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#6b5e54] transition-colors hover:bg-[#e8dfcd] hover:text-[#3d3632]"
          >
            Pricing
          </Link>

          {isLoading ? (
            <div
              className="h-10 w-[118px] animate-pulse rounded-md border border-[#d4c9b8] bg-[#e8dfcd]"
              aria-label="Loading navigation"
            />
          ) : user ? (
            <Button
              asChild
              className="bg-[#3d3632] text-[#f5f1e6] hover:bg-[#2a2522] shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-[#a67c52] text-[#f5f1e6] hover:bg-[#8a6642] shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
