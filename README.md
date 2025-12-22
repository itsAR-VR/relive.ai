# Gifting Moments

**Transform cherished memories into living, breathing films.**

We help you create emotional memory films that bring tears of joy. Perfect for milestone birthdays, holidays, and legacy keepsakes.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://giftingmoments.com)
[![Last Updated](https://img.shields.io/badge/Last%20Updated-Nov%2029%2C%202025-blue?style=for-the-badge)]()

---

## 🎨 Brand & Design System

### Color Palette - "Nostalgic Warmth"

Our design language evokes warmth, nostalgia, and emotional depth.

#### Light Mode
| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#FDFBF7` | Page background (warm cream) |
| **Foreground** | `#2C2C2C` | Primary text (soft black) |
| **Primary** | `#8B2332` | CTAs, accents (maroon/burgundy) |
| **Secondary** | `#F5F0E8` | Cards, secondary backgrounds |
| **Accent** | `#D4AF37` | Gold highlights, badges |
| **Muted** | `#F0EBE3` | Subtle backgrounds |
| **Border** | `#E8E2D9` | Dividers, card borders |

#### Dark Mode
| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#1A1814` | Page background (warm charcoal) |
| **Foreground** | `#F5F0E8` | Primary text |
| **Primary** | `#C9A86C` | CTAs, accents (warm gold) |
| **Accent** | `#D4AF37` | Gold highlights |

### Typography
- **Headings:** Playfair Display (serif) - elegant, timeless feel
- **Body:** Inter (sans-serif) - clean, readable

### Logo
- File: `/public/gifting-moments-logo.svg`
- Two-line stacked design: "gifting" on top, "moments" below
- Uses black/dark foreground color, inverts in dark mode

---

## 🎁 Service Tiers

| Tier | Price | Duration | Description |
|------|-------|----------|-------------|
| **Digital Keepsake** | $49 (from $99) | 15 secs | A single restored memory film |
| **Director's Cut** | $149 (from $299) | 60 secs | A fully crafted emotional film |
| **The Biography** | $299 (from $800) | 3 mins | A multi-scene legacy documentary |

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL Database, Storage)
- **AI:** Kie.ai (Image Enhancement, Video Generation)
- **Payments:** Stripe (Checkout, Webhooks)
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics, Meta Conversions API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/itsAR-VR/relive.ai.git
cd relive.ai

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STANDARD` | Stripe Price ID - Digital Keepsake ($49) |
| `STRIPE_PRICE_PREMIUM` | Stripe Price ID - Director's Cut ($149) |
| `STRIPE_PRICE_BIO` | Stripe Price ID - Biography ($299) |
| `STRIPE_PRICE_CUSTOM` | Stripe Price ID - Revive Clips (Custom) ($8 per clip) |
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL |

### AI Integration (Kie.ai)

| Variable | Description |
|----------|-------------|
| `KIE_API_KEY` | Kie.ai API key |
| `KIE_WEBHOOK_SECRET` | Shared secret for webhook verification |

### Analytics (Optional)

| Variable | Description |
|----------|-------------|
| `META_PIXEL_ID` | Meta Pixel ID |
| `META_CAPI_ACCESS_TOKEN` | Meta Conversions API token |

---

## 🗄 Database Setup

### Quick Setup (Recommended)

Run this migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/FULL_MIGRATION_RUN_THIS.sql
```

This creates all required tables:
- `profiles` - User profile data
- `orders` - Service purchases with quiz/interview data
- `pending_checkouts` - Cross-device authentication support

### Verify Setup

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'pending_checkouts', 'profiles');
```

---

## 🔄 User Flow

```
1. Landing Page → User takes 3-question quiz
2. Quiz → Redirects to Pricing with recommended tier
3. Pricing → User selects package, clicks "Book Now"
4. Stripe Checkout → Payment processed
5. Post-checkout intake → Gift packages: Director Interview • Custom: Photo upload
6. Dashboard → User can view order status
7. Delivery → Memory film delivered via email + private viewing page
```

### Magic Link Authentication

After checkout, users authenticate via magic link:
1. User completes Stripe checkout
2. Lands on `/director-interview?session_id=xxx`
3. Magic link auto-sent to Stripe email
4. Click link → session verified → interview form loads

**Cross-Device Support:** If user clicks magic link on different device, `pending_checkouts` table enables session recovery.

---

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── orders/              # Order management APIs
│   │   ├── stripe/              # Stripe checkout & webhooks
│   │   └── webhooks/            # External webhooks (Stripe, Kie)
│   ├── auth/                    # Auth callbacks
│   ├── dashboard/               # User dashboard
│   ├── director-interview/      # Post-checkout interview
│   ├── pricing/                 # Service tier selection
│   └── page.tsx                 # Landing page
├── components/
│   ├── landing/                 # Landing page components
│   │   ├── header.tsx          # Nav with countdown banner
│   │   ├── split-hero.tsx      # Hero section
│   │   ├── social-proof.tsx    # Testimonials carousel
│   │   ├── how-it-works.tsx    # 3-step process
│   │   └── teaser-quiz.tsx     # 3-question quiz modal
│   ├── director-interview-form.tsx
│   └── hash-auth-listener.tsx  # Global auth handler
├── lib/
│   ├── supabase/               # Supabase clients
│   └── stripe.ts               # Stripe helpers
├── public/
│   └── gifting-moments-logo.svg
└── supabase/
    └── migrations/             # SQL migration scripts
```

---

## 🧪 Development

```bash
# Lint
pnpm lint

# Build
pnpm build

# Start production server
pnpm start
```

---

## 🌐 Domain Setup

### DNS Configuration

Point your domain to Vercel:
- **A Record:** `76.76.19.19`
- **CNAME:** `cname.vercel-dns.com`

### Recommended Domains
- Primary: `giftingmoments.com`
- Alternative: `giftingmoments.co`, `giftmoments.com`

---

## 📝 Troubleshooting

### "No pending order found" after magic link

1. Run `FULL_MIGRATION_RUN_THIS.sql` migration
2. Verify email matches Stripe checkout email
3. Check Vercel logs for API errors

### Quiz closes when clicking outside

This is intentional - users must click X to exit (improves conversion).

### Carousel glitching on reviews

We use pure CSS transitions instead of Embla for smoother animations.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run `pnpm lint` before committing
4. Submit a pull request

---

## 📄 License

MIT

---

*Built with ❤️ for preserving family memories*

**Gifting Moments** — Transform memories into films that make them cry.
