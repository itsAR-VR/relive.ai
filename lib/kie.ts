/**
 * Kie.ai API Client
 * Documentation: https://docs.kie.ai
 */

const KIE_API_BASE = "https://api.kie.ai/v1"

interface KieApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface ImageEnhanceResult {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  result_url?: string
}

interface VideoGenerateResult {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  result_url?: string
}

class KieClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<KieApiResponse<T>> {
    const response = await fetch(`${KIE_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `API error: ${response.status}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  }

  async enhanceImage(params: {
    imageUrl: string
    faceRestoration?: boolean
    colorCorrection?: boolean
    upscale?: number
    webhookUrl?: string
  }): Promise<KieApiResponse<ImageEnhanceResult>> {
    return this.request<ImageEnhanceResult>("/images/enhance", {
      method: "POST",
      body: JSON.stringify({
        image: params.imageUrl,
        options: {
          face_restoration: params.faceRestoration ?? true,
          colorization: params.colorCorrection ?? true,
          upscale_factor: params.upscale ?? 2,
        },
        webhook_url: params.webhookUrl,
      }),
    })
  }

  async generateVideo(params: {
    imageUrl: string
    prompt?: string
    motionStrength?: number
    duration?: number
    webhookUrl?: string
  }): Promise<KieApiResponse<VideoGenerateResult>> {
    return this.request<VideoGenerateResult>("/videos/generate", {
      method: "POST",
      body: JSON.stringify({
        image: params.imageUrl,
        prompt: params.prompt || "gentle natural movement",
        motion_strength: params.motionStrength ?? 50,
        duration_seconds: params.duration ?? 4,
        webhook_url: params.webhookUrl,
      }),
    })
  }

  async getEnhanceStatus(
    jobId: string
  ): Promise<KieApiResponse<ImageEnhanceResult>> {
    return this.request<ImageEnhanceResult>(`/images/enhance/${jobId}`)
  }

  async getVideoStatus(
    jobId: string
  ): Promise<KieApiResponse<VideoGenerateResult>> {
    return this.request<VideoGenerateResult>(`/videos/generate/${jobId}`)
  }
}

export function createKieClient() {
  const apiKey = process.env.KIE_API_KEY
  if (!apiKey) {
    throw new Error("KIE_API_KEY environment variable is not set")
  }
  return new KieClient(apiKey)
}

export type { KieClient, ImageEnhanceResult, VideoGenerateResult }
