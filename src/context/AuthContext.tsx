import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAdminRole = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (error || !data) {
        return currentUser.app_metadata?.role === 'admin' || currentUser.user_metadata?.role === 'admin';
      }
      return data.role === 'admin';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          if (data.session?.user) {
            const adminStatus = await checkAdminRole(data.session.user);
            if (isMounted) setIsAdmin(adminStatus);
          } else {
            if (isMounted) setIsAdmin(false);
          }
        }
      } catch (err) {
        console.warn('Supabase Auth Initialization Notice:', err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const adminStatus = await checkAdminRole(session.user);
            if (isMounted) setIsAdmin(adminStatus);
          } else {
            if (isMounted) setIsAdmin(false);
          }
          setIsLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('Supabase Auth Listener Notice:', err);
      if (isMounted) setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'تعذر العثور على المستخدم' };

      const isUserAdmin = await checkAdminRole(data.user);
      if (!isUserAdmin) {
        await supabase.auth.signOut();
        return { success: false, error: 'غير مصرح لك بالدخول إلى لوحة الإدارة' };
      }

      setIsAdmin(true);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout notice:', err);
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
