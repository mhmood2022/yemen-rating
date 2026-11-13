'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isVisitor: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [supabase]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
      
      // تحديث last_seen
      if (session?.user) {
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', session.user.id);
      }
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    }, []);

  // تحديث last_seen دورياً (كل 60 ثانية)
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };

      if (data.user) {
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'super_admin')) {
          await supabase.auth.signOut();
          return { success: false, error: 'هذا الحساب لا يملك صلاحيات إدارية' };
        }

        setUser(data.user);
        setProfile(adminProfile as UserProfile);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'فشل تسجيل الدخول' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isLoading: loading,
        isOwner: profile?.role === 'owner' && profile?.status === 'active',
        isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
        isVisitor: profile?.role === 'visitor' || !profile?.role,
        signInWithGoogle,
        signOut,
        logout: signOut,
        loginAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
