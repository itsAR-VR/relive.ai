# Feature Plan (Current Status & Next Steps)

## Current Status
- Auth: Supabase email/Google working; session middleware in place.
- Stripe: Test-mode prices wired (`STRIPE_PRICE_CAPSULE/MEMORY/LEGACY`); checkout works in test.
- Kie.ai: Using new jobs API.
  - Image: `model: nano-banana-pro` via `/api/v1/jobs/createTask`; status via `/api/v1/jobs/recordInfo`.
  - Video: `model: wan/2-5-image-to-video` via `/api/v1/jobs/createTask`; status via `/api/v1/jobs/recordInfo`.
  - Webhooks: `/api/webhooks/kie` parses `state/resultJson/failMsg`; optional `KIE_WEBHOOK_SECRET`/IP allowlist.
  - Data URLs are uploaded to Supabase Storage (`user-uploads`) to produce public URLs before Kie submission.
  - Frontend flows (Enhance/Relive/Christmas) wired to new payloads; Younger/Family gated as “coming soon.”
- Build/lint: `pnpm lint`/`pnpm build` pass (warnings: multiple lockfiles root inference; middleware deprecation).

## Next Steps (Parallel-Friendly)
1) **End-to-end QA (logged-in)**  
   - Enhance (image) → Relive (video) → confirm credits, result URLs, webhook completion, no double refunds.  
   - Christmas static + animated paths.  
   - Error path (bad URL) to see toasts/refund behavior.

2) **Observability**  
   - Monitor Vercel logs for Kie errors; verify structured logs include jobId/userId/generationId.  
   - Optional: add a minimal status/debug view for recent generations (taskId/state/resultUrl).

3) **Younger/Family**  
   - Decide to keep gated or implement once Kie endpoints/params are available.

4) **Housekeeping**  
   - Resolve multiple lockfiles warning (set `turbopack.root` or remove extra lockfile).  
   - Plan migration from `middleware` to `proxy` per Next.js notice.  
   - Keep README/AGENTS in sync with Kie payloads/envs.

## Deployment Checklist
- Env keys aligned to mode (Stripe test vs live; Kie keys set; webhook secret optional but recommended).
- Run `pnpm lint` / `pnpm build`.
- Perform QA steps above; confirm credits and result URLs update in Supabase.
