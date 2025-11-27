"use client"

import { createBrowserClient } from "@supabase/ssr"
import { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

export function createClient() {
  // Return cached client if available
  if (client) return client

  // Check if we're in a browser environment and have the required env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build/SSR without env vars, return a dummy client that will be replaced on hydration
    // This prevents build errors while still allowing client-side functionality
    throw new Error("Supabase environment variables are not configured")
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
