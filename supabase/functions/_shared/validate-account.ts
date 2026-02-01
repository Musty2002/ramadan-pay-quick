interface ProfileData {
  is_blocked: boolean | null;
  virtual_account_name: string | null;
  full_name: string;
}

/**
 * Validates that a user has a valid virtual account before allowing purchases
 * This prevents fraudulent transactions from accounts that were not properly set up
 */
export async function validateUserAccount(
  supabase: any,
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check if user is blocked
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('is_blocked, virtual_account_name, full_name')
      .eq('user_id', userId)
      .single();

    const profile = data as ProfileData | null;

    if (profileError || !profile) {
      return { valid: false, error: 'User profile not found' };
    }

    if (profile.is_blocked) {
      return { valid: false, error: 'Your account has been suspended. Contact support.' };
    }

    // Check if user has a valid virtual account (PaymentPoint account)
    if (!profile.virtual_account_name) {
      return { 
        valid: false, 
        error: 'Account setup incomplete. Please contact support to complete your virtual account setup.' 
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating user account:', error);
    return { valid: false, error: 'Failed to validate account' };
  }
}
