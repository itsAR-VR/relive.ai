"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import {
  Sparkles,
  CreditCard,
  Image,
  Video,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  credits: number
  tier: string
}

interface Generation {
  id: string
  type: "image_enhance" | "video_generate"
  status: "pending" | "processing" | "completed" | "failed"
  original_image_url: string | null
  result_url: string | null
  prompt: string | null
  credits_used: number
  created_at: string
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  generations: Generation[]
}

export function DashboardContent({
  user,
  profile,
  generations,
}: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getStatusIcon = (status: Generation["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1e6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#e2d8c3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#a67c52] to-[#8d6e4c] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#3d3632]">Relive</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f1e6] rounded-full border border-[#e2d8c3]">
              <CreditCard className="w-4 h-4 text-[#a67c52]" />
              <span className="text-sm font-medium text-[#3d3632]">
                {profile?.credits ?? 0} credits
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#7d6b56] hidden sm:block">
                {user.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-[#dbd0ba] text-[#7d6b56] hover:bg-[#f5f1e6]"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3d3632]">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-[#7d6b56]">
            Ready to bring more memories to life?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/#live-demo">
            <div className="bg-gradient-to-br from-[#a67c52] to-[#8d6e4c] rounded-xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6" />
                </div>
                <Plus className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Enhance Photo</h3>
              <p className="text-white/80 text-sm">
                Restore and colorize old photos with AI
              </p>
              <p className="mt-3 text-xs text-white/60">Uses 1 credit</p>
            </div>
          </Link>

          <Link href="/#live-demo">
            <div className="bg-gradient-to-br from-[#3d3632] to-[#2a2522] rounded-xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <Plus className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Generate Video</h3>
              <p className="text-white/80 text-sm">
                Bring still photos to life with motion
              </p>
              <p className="mt-3 text-xs text-white/60">Uses 5 credits</p>
            </div>
          </Link>
        </div>

        {/* Buy Credits CTA */}
        {(profile?.credits ?? 0) < 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-amber-800 font-medium">Running low on credits</p>
                <p className="text-amber-600 text-sm">Get more credits to continue creating</p>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Buy Credits
              </Button>
            </Link>
          </div>
        )}

        {/* Recent Generations */}
        <div>
          <h2 className="text-xl font-semibold text-[#3d3632] mb-4">
            Recent Creations
          </h2>

          {generations.length === 0 ? (
            <div className="bg-white/60 border border-[#e2d8c3] rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-[#f5f1e6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-[#8a7e72]" />
              </div>
              <h3 className="text-lg font-medium text-[#3d3632] mb-1">
                No creations yet
              </h3>
              <p className="text-[#7d6b56] mb-4">
                Start by enhancing a photo or generating a video
              </p>
              <Link href="/#live-demo">
                <Button className="bg-[#a67c52] hover:bg-[#8d6e4c] text-white">
                  Create Your First
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="bg-white/80 border border-[#e2d8c3] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[#e2d8c3] relative">
                    {gen.result_url ? (
                      <img
                        src={gen.result_url}
                        alt="Generation result"
                        className="w-full h-full object-cover"
                      />
                    ) : gen.original_image_url ? (
                      <img
                        src={gen.original_image_url}
                        alt="Original"
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {gen.type === "image_enhance" ? (
                          <Image className="w-8 h-8 text-[#8a7e72]" />
                        ) : (
                          <Video className="w-8 h-8 text-[#8a7e72]" />
                        )}
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
                      {gen.type === "image_enhance" ? "Photo" : "Video"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(gen.status)}
                        <span className="text-sm text-[#7d6b56] capitalize">
                          {gen.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#8a7e72]">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {gen.prompt && (
                      <p className="mt-2 text-xs text-[#7d6b56] line-clamp-2">
                        {gen.prompt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

