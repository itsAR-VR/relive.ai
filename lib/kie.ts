/**
 * Kie.ai API Client
 * Documentation: https://docs.kie.ai
 * Implements:
 *  - POST /api/v1/jobs/createTask (Wan 2.5 image-to-video, Nano Banana Pro image)
 *  - GET  /api/v1/jobs/recordInfo   (status/result)
 */

const KIE_API_BASE = "https://api.kie.ai/api/v1"

interface KieApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  status?: number
  raw?: unknown
}

type KieState = "waiting" | "queuing" | "generating" | "success" | "fail"

interface KieJobCreateResponse {
  code?: number
  message?: string
  data?: { taskId: string }
}

interface KieRecordInfo {
  code?: number
  message?: string
  data?: {
    taskId: string
    model: string
    state: KieState
    resultJson?: string
    failCode?: string
    failMsg?: string
  }
}

interface NormalizedResult {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  result_url?: string
  error?: string
  raw?: unknown
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
    try {
      const response = await fetch(`${KIE_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      })

      const responseBody = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          (responseBody && (responseBody.message || responseBody.msg || responseBody.error)) ||
          `API error: ${response.status}`

        return {
          success: false,
          error: message,
          status: response.status,
          raw: responseBody,
        }
      }

      return {
        success: true,
        data: responseBody,
        status: response.status,
        raw: responseBody,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown API error",
      }
    }
  }

  private normalizeRecordInfo(record?: KieRecordInfo): NormalizedResult | null {
    if (!record?.data?.taskId) return null

    const state = record.data.state
    let status: NormalizedResult["status"] = "processing"
    if (state === "success") status = "completed"
    else if (state === "fail") status = "failed"

    let resultUrl: string | undefined
    if (record.data.resultJson) {
      try {
        const parsed = JSON.parse(record.data.resultJson)
        const urls: string[] | undefined = parsed?.resultUrls
        if (Array.isArray(urls) && urls.length > 0) {
          resultUrl = urls[0]
        }
      } catch {
        // ignore parse errors
      }
    }

    const error =
      record.data.failMsg ||
      record.data.failCode ||
      record.message ||
      (record.code && record.code !== 200 ? `Kie error code ${record.code}` : undefined)

    return {
      id: record.data.taskId,
      status,
      result_url: resultUrl,
      error,
      raw: record,
    }
  }

  /**
   * Create job (generic)
   */
  private async createJob(payload: {
    model: string
    input: Record<string, unknown>
    callBackUrl?: string
  }): Promise<KieApiResponse<{ id: string }>> {
    const res = await this.request<KieJobCreateResponse>("/jobs/createTask", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (!res.success || !res.data?.data?.taskId) {
      return {
        success: false,
        error: res.error || "Failed to create Kie job",
        status: res.status,
        raw: res.raw,
      }
    }

    return {
      success: true,
      data: { id: res.data.data.taskId },
      status: res.status,
      raw: res.raw,
    }
  }

  /**
   * Enhance/generate image with Nano Banana Pro
   */
  async enhanceImage(params: {
    imageUrl: string
    prompt?: string
    aspectRatio?: string
    resolution?: string
    outputFormat?: string
    webhookUrl?: string
  }): Promise<KieApiResponse<{ id: string }>> {
    return this.createJob({
      model: "nano-banana-pro",
      callBackUrl: params.webhookUrl,
      input: {
        prompt: params.prompt || "Restore and enhance this photo with natural colors and details.",
        image_input: [params.imageUrl],
        aspect_ratio: params.aspectRatio || "1:1",
        resolution: params.resolution || "1K",
        output_format: params.outputFormat || "png",
      },
    })
  }

  /**
   * Generate video from image using Wan 2.5 image-to-video
   */
  async generateVideo(params: {
    imageUrl: string
    prompt: string
    duration?: number
    resolution?: "720p" | "1080p"
    negativePrompt?: string
    enablePromptExpansion?: boolean
    seed?: number
    webhookUrl?: string
  }): Promise<KieApiResponse<{ id: string }>> {
    return this.createJob({
      model: "wan/2-5-image-to-video",
      callBackUrl: params.webhookUrl,
      input: {
        prompt: params.prompt,
        image_url: params.imageUrl,
        duration: `${params.duration ?? 5}`,
        resolution: params.resolution || "1080p",
        negative_prompt: params.negativePrompt,
        enable_prompt_expansion: params.enablePromptExpansion ?? false,
        seed: params.seed ?? null,
      },
    })
  }

  /**
   * Check the status of any job
   */
  async getJobStatus(jobId: string): Promise<KieApiResponse<NormalizedResult>> {
    const res = await this.request<KieRecordInfo>(`/jobs/recordInfo?taskId=${jobId}`, {
      method: "GET",
    })

    if (!res.success) return res as KieApiResponse<NormalizedResult>

    const normalized = this.normalizeRecordInfo(res.data)
    if (!normalized) {
      return {
        success: false,
        error: "Invalid status payload",
        status: res.status,
        raw: res.raw,
      }
    }

    return {
      success: true,
      data: normalized,
      status: res.status,
      raw: res.raw,
    }
  }
}

// Export a singleton instance
export function createKieClient() {
  const apiKey = process.env.KIE_API_KEY
  if (!apiKey) {
    throw new Error("KIE_API_KEY environment variable is not set")
  }
  return new KieClient(apiKey)
}

export type { KieClient, NormalizedResult }
