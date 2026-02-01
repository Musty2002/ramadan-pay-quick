import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Wallet, CashbackWallet } from '@/types/database';

interface ExtendedProfile extends Profile {
  is_blocked?: boolean;
  blocked_at?: string | null;
  blocked_reason?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ExtendedProfile | null;
  wallet: Wallet | null;
  cashbackWallet: CashbackWallet | null;
  loading: boolean;
  isBlocked: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, referralCode?: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshCashbackWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [cashbackWallet, setCashbackWallet] = useState<CashbackWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const fetchProfile = async (userId: string, retryCount = 0): Promise<void> => {
    const { data } = await supabase
      .from('profiles')
      .select('*, is_blocked, blocked_at, blocked_reason')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setProfile(data as ExtendedProfile);
      setIsBlocked(data.is_blocked === true);
    } else if (retryCount < 3) {
      // Retry after a short delay - the database trigger might not have completed yet
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetchProfile(userId, retryCount + 1);
    }
  };

  const fetchWallet = async (userId: string, retryCount = 0): Promise<void> => {
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setWallet(data as Wallet);
    } else if (retryCount < 3) {
      // Retry after a short delay - the database trigger might not have completed yet
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetchWallet(userId, retryCount + 1);
    }
  };

  const fetchCashbackWallet = async (userId: string, retryCount = 0): Promise<void> => {
    const { data } = await supabase
      .from('cashback_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setCashbackWallet(data as CashbackWallet);
    } else if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetchCashbackWallet(userId, retryCount + 1);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchWallet(session.user.id);
            fetchCashbackWallet(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setWallet(null);
          setCashbackWallet(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWallet(session.user.id);
        fetchCashbackWallet(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createVirtualAccountWithRetry = async (
    userId: string,
    email: string,
    name: string,
    phoneNumber: string,
    maxRetries = 3
  ): Promise<void> => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Creating virtual account (attempt ${attempt + 1}/${maxRetries})...`);
        
        const { data: vaData, error: vaError } = await supabase.functions.invoke('create-virtual-account', {
          body: { userId, email, name, phoneNumber }
        });
        
        if (vaError) {
          throw vaError;
        }
        
        console.log('Virtual account created successfully:', vaData);
        await fetchProfile(userId);
        return;
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        
        if (attempt < maxRetries - 1) {
          const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Retrying in ${backoffMs / 1000}s...`);
          await delay(backoffMs);
        }
      }
    }
    
    console.error('All retry attempts failed for virtual account creation');
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          referral_code: referralCode || null,
        }
      }
    });
    
    // If signup successful, automatically create virtual account with retry
    if (!error && data.user && data.session) {
      // Start the retry process in background (don't block signup)
      createVirtualAccountWithRetry(data.user.id, email, fullName, phone);
    }
    
    return { error: error as Error | null, data: data ? { user: data.user } : null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null, data: data ? { user: data.user } : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setWallet(null);
    setCashbackWallet(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshWallet = async () => {
    if (user) {
      await fetchWallet(user.id);
    }
  };

  const refreshCashbackWallet = async () => {
    if (user) {
      await fetchCashbackWallet(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      wallet,
      cashbackWallet,
      loading,
      isBlocked,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      refreshWallet,
      refreshCashbackWallet,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}