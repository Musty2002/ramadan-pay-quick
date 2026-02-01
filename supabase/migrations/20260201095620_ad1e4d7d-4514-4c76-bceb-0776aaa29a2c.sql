-- ============================================
-- 1. FIX WALLET SECURITY VULNERABILITY
-- Remove client-side wallet update capability
-- ============================================

-- Drop the dangerous policy that allows users to update their own wallet
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;

-- Create a new policy that ONLY allows service role (edge functions) to update wallets
-- Regular authenticated users cannot update wallets directly
CREATE POLICY "Only service role can update wallets"
ON public.wallets
FOR UPDATE
USING (false)  -- No one can update via client
WITH CHECK (false);  -- Extra safety

-- Keep admin view policy for dashboard
-- (Admins can VIEW but not UPDATE from client - updates go through edge functions)

-- ============================================
-- 2. ADD USER BLOCKING/SUSPENSION FEATURE
-- ============================================

-- Add blocking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS blocked_reason text,
ADD COLUMN IF NOT EXISTS blocked_by uuid REFERENCES auth.users(id);

-- Create index for quick blocked user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked) WHERE is_blocked = true;

-- Create a function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Update RLS policies to block access for suspended users
-- Wallets: blocked users cannot view their wallet
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_blocked(auth.uid())
);

-- Transactions: blocked users cannot view or create transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_blocked(auth.uid())
);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND NOT public.is_user_blocked(auth.uid())
);

-- Profiles: blocked users can still view their profile (to see blocked message)
-- but cannot update it
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_blocked(auth.uid())
);

-- Allow admins to update profiles (for blocking)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Notifications: blocked users cannot access notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_blocked(auth.uid())
);