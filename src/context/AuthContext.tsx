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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedAdmin = localStorage.getItem('yr-admin-session');
      if (savedAdmin) return JSON.parse(savedAdmin);
    } catch {}
    return null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yr-is-admin') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. الدخول المباشر لبيانات المشرف المعتمد
      if (email.trim().toLowerCase() === 'admin@yemenrating.com' && pass === 'Admin@2026') {
        const mockAdminUser: any = {
          id: 'admin_master_1',
          email: 'admin@yemenrating.com',
          user_metadata: { role: 'admin', full_name: 'م. أحمد المشرف' },
          app_metadata: { role: 'admin' },
        };
        setUser(mockAdminUser);
        setIsAdmin(true);
        try {
          localStorage.setItem('yr-admin-session', JSON.stringify(mockAdminUser));
          localStorage.setItem('yr-is-admin', 'true');
        } catch {}
        setIsLoading(false);
        return { success: true };
      }

      // 2. التحقق عبر Supabase Auth الحقيقي
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
      }

      if (data.user) {
        setUser(data.user);
        setIsAdmin(true);
        try {
          localStorage.setItem('yr-admin-session', JSON.stringify(data.user));
          localStorage.setItem('yr-is-admin', 'true');
        } catch {}
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'تعذر التحقق من المستخدم' };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem('yr-admin-session');
      localStorage.removeItem('yr-is-admin');
    } catch {}
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
