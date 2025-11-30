-- =============================================
-- SUPPORT TICKETS TABLE
-- =============================================
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS support_tickets_email_idx ON public.support_tickets(email);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON public.support_tickets(created_at DESC);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can view their own tickets (by user_id or email match)
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (
    auth.uid() = user_id 
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Anyone can create tickets (including anonymous users)
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
CREATE POLICY "Anyone can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

-- Service role has full access (for API routes and admin)
DROP POLICY IF EXISTS "Service role full access" ON public.support_tickets;
CREATE POLICY "Service role full access" ON public.support_tickets
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Grants
GRANT SELECT, INSERT ON public.support_tickets TO anon, authenticated;
GRANT ALL ON public.support_tickets TO service_role;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- After running, verify table exists:
-- SELECT * FROM public.support_tickets LIMIT 1;

-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'support_tickets';

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================
