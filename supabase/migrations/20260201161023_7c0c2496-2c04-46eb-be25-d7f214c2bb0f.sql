-- Create a function to check login sessions and block web signups
CREATE OR REPLACE FUNCTION public.auto_block_web_signups()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this user has any login session from web platform
  -- If they do, automatically block them
  IF EXISTS (
    SELECT 1 FROM public.login_sessions 
    WHERE user_id = NEW.user_id 
    AND platform = 'web'
    LIMIT 1
  ) THEN
    -- Auto-block users who logged in from web
    NEW.is_blocked := true;
    NEW.blocked_reason := 'Unauthorized web login attempt detected. Please use the mobile app.';
    NEW.blocked_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table to auto-block web users on any update
DROP TRIGGER IF EXISTS trigger_auto_block_web_signups ON public.profiles;
CREATE TRIGGER trigger_auto_block_web_signups
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_block_web_signups();

-- Also create a function to retroactively block existing web users
CREATE OR REPLACE FUNCTION public.block_all_web_users()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles p
  SET 
    is_blocked = true,
    blocked_reason = 'Unauthorized web login detected. Please use the mobile app.',
    blocked_at = now()
  WHERE EXISTS (
    SELECT 1 FROM public.login_sessions ls 
    WHERE ls.user_id = p.user_id 
    AND ls.platform = 'web'
  )
  AND (p.is_blocked IS NULL OR p.is_blocked = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;