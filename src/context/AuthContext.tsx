import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types';
import { fetchProfile } from '../services/profiles';

const LOCAL_USER_KEY = 'ethionutrition_demo_user';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function createMockUser(email: string): User {
  return {
    id: 'demo-user-id-001',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
  } as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured();

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const p = await fetchProfile(user.id);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Local demo mode: auto-initialize guest user so all features are immediately testable
      const savedEmail = localStorage.getItem(LOCAL_USER_KEY);
      if (savedEmail !== 'logged_out') {
        const activeEmail = savedEmail || 'guest@ethionutrition.com';
        setUser(createMockUser(activeEmail));
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    // Live Supabase Mode
    let isMounted = true;
    const timeout = setTimeout(() => {
      // Safety watchdog: ensure loading never hangs beyond 2.5s if Supabase fails to respond
      if (isMounted) setLoading(false);
    }, 2500);

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (!isMounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Supabase auth session fetch error:', err);
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!isMounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ user: User | null; session: Session | null }> => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem(LOCAL_USER_KEY, email);
      const mock = createMockUser(email);
      setUser(mock);
      return { user: mock, session: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { user: data.user, session: data.session };
  };

  const resendVerification = async (email: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ user: User | null; session: Session | null }> => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem(LOCAL_USER_KEY, email);
      const mock = createMockUser(email);
      setUser(mock);
      return { user: mock, session: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { user: data.user, session: data.session };
  };

  const signInAsDemo = async () => {
    const demoEmail = 'guest@ethionutrition.com';
    localStorage.setItem(LOCAL_USER_KEY, demoEmail);
    setUser(createMockUser(demoEmail));
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.setItem(LOCAL_USER_KEY, 'logged_out');
    if (!isSupabaseConfigured()) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return; // Simulated success in demo mode
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoMode,
        signUp,
        signIn,
        signInAsDemo,
        signOut,
        resetPassword,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
