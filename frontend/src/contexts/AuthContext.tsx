import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  institution_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  completeProfile: (data: SignUpData & { id: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  institutionCode?: string;   // for teachers/students joining existing institution
  institutionName?: string;   // for admins creating new institution
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as UserProfile);
      if (data.theme) {
        window.dispatchEvent(new CustomEvent('luma-theme-sync', { detail: data.theme }));
      }
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signUp({ email, password, name, role, institutionCode, institutionName }: SignUpData) {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, name, role,
          // Only send the relevant field — never send empty strings
          ...(role === 'admin'
            ? { institutionName }
            : { institutionCode: institutionCode?.toUpperCase() }),
        }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error ?? 'Registration failed.' };
      return { error: null };
    } catch {
      return { error: 'Could not reach server. Please try again.' };
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? error.message : null };
  }

  async function completeProfile(data: SignUpData & { id: string }) {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    try {
      const res = await fetch(`${API_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          institutionCode: data.institutionCode?.toUpperCase(),
        }),
      });
      const body = await res.json();
      if (!res.ok) return { error: body.error ?? 'Profile completion failed.' };
      await fetchProfile(data.id);
      return { error: null };
    } catch {
      return { error: 'Could not reach server. Please try again.' };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signInWithGoogle, signUp, resetPassword, completeProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
