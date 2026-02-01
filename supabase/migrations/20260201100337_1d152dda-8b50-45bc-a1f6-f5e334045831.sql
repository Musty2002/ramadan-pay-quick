
-- Create login sessions table to track device/platform information
CREATE TABLE public.login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'android', 'ios', 'web'
  device_info JSONB, -- Additional device details
  ip_address TEXT,
  user_agent TEXT,
  logged_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_suspicious BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own login sessions"
ON public.login_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own login sessions"
ON public.login_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all login sessions"
ON public.login_sessions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_login_sessions_user_id ON public.login_sessions(user_id);
CREATE INDEX idx_login_sessions_logged_in_at ON public.login_sessions(logged_in_at DESC);
