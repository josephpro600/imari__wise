import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchProfile, saveProfile, type ProfilePatch } from '@/lib/profile-api';
import type { Profile } from '@/types/finance';

interface AuthValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applySession = async (next: Session | null) => {
      let nextProfile: Profile | null = null;
      if (next) {
        try {
          nextProfile = await fetchProfile(next.user.id);
        } catch (error) {
          console.error(error);
        }
      }
      if (!active) return;
      setSession(next);
      setProfile(nextProfile);
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      (async () => {
        await applySession(next);
      })();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const userId = session?.user.id ?? null;

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) throw new Error('Not signed in');
      const saved = await saveProfile(userId, patch);
      setProfile(saved);
    },
    [userId],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [session, profile, loading, signIn, signUp, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
