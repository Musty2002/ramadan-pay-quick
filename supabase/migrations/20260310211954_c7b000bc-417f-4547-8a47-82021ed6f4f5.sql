CREATE OR REPLACE FUNCTION public.deduct_wallet_balance(
  _user_id uuid,
  _amount numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rows_affected integer;
BEGIN
  -- Atomic deduction: only succeeds if balance is sufficient
  -- Uses row-level locking to prevent race conditions
  UPDATE public.wallets
  SET balance = balance - _amount,
      updated_at = now()
  WHERE user_id = _user_id
    AND balance >= _amount;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$$;