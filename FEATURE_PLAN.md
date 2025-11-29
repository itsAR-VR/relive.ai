# Gifting Moments - Feature Plan

## Current Status (Nov 29, 2025)

### ✅ Completed
- **Authentication:** Supabase magic link flow working (cross-device support)
- **Payments:** Stripe checkout with 3 tiers ($49/$149/$299)
- **Landing Page:** Quiz flow, testimonials, countdown banner
- **Director Interview:** Post-checkout interview form with file uploads
- **Dashboard:** User order management
- **Branding:** "Gifting Moments" theme with maroon/gold palette

### 🔄 In Progress
- AI Integration (Kie.ai) for video generation
- Admin dashboard for order management

## Service Tiers

| Tier | Price | Duration | Key Features |
|------|-------|----------|--------------|
| Digital Keepsake | $49 | 15 secs | 1 restored memory, Super 8 style |
| Director's Cut | $149 | 60 secs | 20 scene curation, sound design, private viewing page |
| The Biography | $299 | 3 mins | 3 scenes, consultation call, custom narration |

## AI Integration (Kie.ai)

### Image Enhancement
- Model: `nano-banana-pro`
- Endpoint: `POST /api/v1/jobs/createTask`

### Video Generation
- Model: `wan/2-5-image-to-video`
- Endpoint: `POST /api/v1/jobs/createTask`

### Webhooks
- Status: `GET /api/v1/jobs/recordInfo?taskId=...`
- Callback: `/api/webhooks/kie`

## Next Steps

### 1. AI Pipeline (Priority)
- [ ] Complete Kie.ai integration for image enhancement
- [ ] Complete video generation pipeline
- [ ] Add job status tracking in database

### 2. Admin Dashboard
- [ ] View all orders
- [ ] Update order status
- [ ] Upload final video files
- [ ] Send delivery notifications

### 3. Delivery System
- [ ] Private viewing page (`/view/[id]`)
- [ ] Email delivery with video link
- [ ] Gift recipient tracking

### 4. Analytics
- [ ] Meta Conversions API events
- [ ] Purchase tracking
- [ ] Funnel analytics

## Deployment Checklist

- [ ] Verify Stripe keys (test vs live mode)
- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Test full checkout flow
- [ ] Verify webhook endpoints
- [ ] DNS configuration for domain

---

*Last updated: November 29, 2025*
