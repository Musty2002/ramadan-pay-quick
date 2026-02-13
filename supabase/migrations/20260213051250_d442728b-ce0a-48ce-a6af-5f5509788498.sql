-- Remove the trigger that blocks web signups
DROP TRIGGER IF EXISTS trigger_auto_block_web_signups ON public.profiles;
DROP FUNCTION IF EXISTS public.auto_block_web_signups();