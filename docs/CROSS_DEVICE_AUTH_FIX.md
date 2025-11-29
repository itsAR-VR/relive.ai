# Cross-Device Authentication Fix - Complete Documentation

**Project:** Gifting Moments  
**Date:** November 29, 2025  
**Status:** ✅ RESOLVED  
**Issue:** Magic link authentication flow was broken, preventing users from completing the director interview after checkout.

---

## Problem Summary

After completing Stripe checkout, users were unable to proceed to the director interview form. The magic link authentication flow was failing with various errors:

- `404` errors on `/api/orders/claim`
- `406` errors on `/api/checkout/pending`
- "Could not find your order" message
- "Still waiting for login" on desktop after mobile verification
- `otp_expired` and `access_denied` errors

## Root Causes Identified

### 1. Database Tables Did Not Exist (Critical)
The `orders` and `pending_checkouts` tables were never created in Supabase. All API calls to these tables returned 404/406 errors.

### 2. Missing UNIQUE Constraint on `pending_checkouts.email`
The migration had `email text not null` but was missing `UNIQUE`, causing the `upsert` with `onConflict: "email"` to fail silently.

### 3. HashAuthListener Missing Email Lookup
After setting the auth session, the listener only tried URL params and localStorage to recover `session_id`. In cross-device scenarios (user starts checkout on desktop, clicks email on mobile), both sources would be empty.

### 4. Race Condition in Session Persistence
`supabase.auth.setSession()` was being followed immediately by `window.location.replace()`, sometimes before the session was persisted to storage.

---

## Files Modified

### 1. `supabase/migrations/004_pending_checkouts.sql`
**Change:** Added `UNIQUE` constraint on email column.

```sql
-- Before
email text not null,

-- After  
email text not null unique,
```

### 2. `supabase/migrations/FULL_MIGRATION_RUN_THIS.sql` (NEW)
**Purpose:** Comprehensive migration script with all required tables and policies.

**Tables Created:**
- `profiles` - User profile data
- `orders` - Service purchases with quiz/interview data
- `pending_checkouts` - Email → session_id mapping for cross-device auth

**Key Features:**
- RLS (Row Level Security) enabled on all tables
- Service role policies for API routes
- User policies for dashboard access
- Proper indexes for performance

### 3. `components/hash-auth-listener.tsx`
**Changes:**
1. Added email-based `session_id` lookup from `pending_checkouts` table
2. Added retry loop to verify session persistence before redirect
3. Added `auth_complete=true` flag to redirect URL

```typescript
// NEW: Email lookup for cross-device support
if (!sessionId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email) {
    const lookupRes = await fetch(`/api/checkout/pending?email=${encodeURIComponent(user.email)}`)
    if (lookupRes.ok) {
      const lookupData = await lookupRes.json()
      if (lookupData.session_id) {
        sessionId = lookupData.session_id
      }
    }
  }
}
```

### 4. `app/director-interview/page.tsx`
**Changes:**
1. Improved cross-device UX messaging
2. Added tip about clicking email on same device
3. Changed "still waiting" message to explain cross-device scenario

```tsx
// NEW: Helpful tip for users
<p className="text-xs text-muted-foreground mt-2 italic">
  Tip: Click the email link on this same device, or continue on whatever device you clicked it.
</p>

// UPDATED: More informative message
setAuthMessage("No active session found. If you clicked the email link on another device (like your phone), please continue there. Otherwise, click 'Send magic link' to try again.")
```

### 5. `README.md`
**Added Sections:**
- Magic Link Authentication Flow overview
- Cross-Device Support explanation
- Database Migrations documentation
- Troubleshooting guide with common issues
- Debugging tips

---

## API Endpoints Involved

### `/api/orders/claim` (POST)
Claims an order for the authenticated user.

**Request:**
```json
{ "session_id": "cs_test_xxx" }
```

**Response:**
```json
{ "order": { "id": "uuid", "tier": "premium", "quiz_data": {...} } }
```

### `/api/checkout/pending` (POST/GET/DELETE)
Manages email → session_id mapping for cross-device auth.

**POST:** Store mapping before sending magic link
```json
{ "email": "user@example.com", "session_id": "cs_test_xxx" }
```

**GET:** Lookup session_id by email
```
/api/checkout/pending?email=user@example.com
→ { "session_id": "cs_test_xxx" }
```

**DELETE:** Remove mapping after successful claim

### `/api/orders/pending` (GET)
Fetches authenticated user's most recent pending order.

---

## Authentication Flow (Final Working Version)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│ 1. User completes Stripe checkout                                   │
│ 2. Stripe webhook creates order in DB (or claim route creates it)   │
│ 3. User lands on /director-interview?session_id=cs_test_xxx         │
│ 4. User enters email, clicks "Send magic link"                      │
│ 5. Frontend stores (email, session_id) in pending_checkouts table   │
│ 6. Supabase sends magic link email                                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EMAIL CLICK (Same Device)                       │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Magic link redirects to /#access_token=xxx&refresh_token=xxx     │
│ 2. HashAuthListener detects hash tokens                             │
│ 3. Sets Supabase session with setSession()                          │
│ 4. Verifies session persisted (retry loop)                          │
│ 5. Recovers session_id from localStorage                            │
│ 6. Calls /api/orders/claim with session_id                          │
│ 7. Redirects to /director-interview?session_id=xxx&auth_complete=true│
│ 8. Interview form loads with order data                             │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EMAIL CLICK (Different Device)                    │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Magic link redirects to /#access_token=xxx (no session_id)       │
│ 2. HashAuthListener detects hash tokens                             │
│ 3. Sets Supabase session                                            │
│ 4. No session_id in URL or localStorage (different device!)         │
│ 5. Gets user email from session                                     │
│ 6. Calls /api/checkout/pending?email=xxx to lookup session_id       │
│ 7. Recovers session_id from pending_checkouts table                 │
│ 8. Calls /api/orders/claim with recovered session_id                │
│ 9. Redirects to /director-interview?session_id=xxx&auth_complete=true│
│ 10. Interview form loads with order data                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `orders` Table
```sql
CREATE TABLE public.orders (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending_interview',
  tier text NOT NULL DEFAULT 'standard',
  quiz_data jsonb DEFAULT '{}',
  interview_data jsonb DEFAULT '{}',
  final_video_url text,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,
  amount_paid integer,
  currency text DEFAULT 'usd',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### `pending_checkouts` Table
```sql
CREATE TABLE public.pending_checkouts (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,  -- UNIQUE is critical for upsert!
  stripe_session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);
```

---

## Lessons Learned

1. **Always run migrations** - The tables need to exist before the code can use them.

2. **UNIQUE constraints matter** - Upsert with `onConflict` requires a unique constraint on the conflict column.

3. **Cross-device auth needs server-side storage** - localStorage doesn't sync between devices, so session_id must be stored in the database.

4. **Race conditions are real** - `setSession()` is async; verify the session is persisted before redirecting.

5. **Check Supabase logs** - The Edge logs clearly showed 404/406 errors indicating missing tables.

---

## Testing Checklist

- [x] Fresh checkout → magic link → same device → interview form loads
- [x] Fresh checkout → magic link → different device → interview form loads  
- [x] Order appears in dashboard after claiming
- [x] Interview progress saves
- [x] Quiz data carries over from checkout
- [x] Error handling for expired links

---

## Commits

1. `98ba57d2` - fix: cross-device authentication flow and documentation
2. `7fe0c1a0` - feat: add comprehensive full migration script

---

*Documentation created: November 29, 2025*
