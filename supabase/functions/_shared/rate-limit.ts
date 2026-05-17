// Rate limiting: check if user has made a purchase in the last COOLDOWN_SECONDS
const COOLDOWN_SECONDS = 5;

export async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const cutoff = new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .select('created_at')
    .eq('user_id', userId)
    .eq('type', 'debit')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Rate limit check error:', error);
    // Allow on error to not block legitimate purchases
    return { allowed: true };
  }

  if (data && data.length > 0) {
    const lastPurchase = new Date(data[0].created_at).getTime();
    const elapsed = Math.floor((Date.now() - lastPurchase) / 1000);
    const retryAfter = COOLDOWN_SECONDS - elapsed;
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  return { allowed: true };
}
