'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X, User, Mail, Lock, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'register' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'register',
}) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'register' | 'login'>(defaultMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // إغلاق النافذة عند الضغط على الخلفية الفارغة
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // إنشاء حساب زائر جديد
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('يرجى كتابة الاسم الكامل');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (error) {
      setErrorMsg(error.message === 'User already registered' ? 'هذا البريد مسجل مسبقاً، يمكنك تسجيل الدخول.' : error.message);
      setLoading(false);
    } else {
      if (data.session) {
        onClose();
        navigate('/account');
      } else {
        setSuccessMsg('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        setAuthMode('login');
      }
      setLoading(false);
    }
  };

  // تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    } else {
      onClose();
      navigate('/account');
    }
  };

  // Google OAuth
  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/account',
      },
    });
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-['Cairo',sans-serif] animate-fade-in"
      dir="rtl"
    >
      {/* بطاقة النافذة بهوية يمن ريتنغ الداكنة */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-white overflow-hidden"
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 left-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        {/* رأس النافذة */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/10 text-[#FFC500] border border-yellow-500/20 mb-2.5">
            <User size={24} />
          </div>
          <h2 className="text-lg font-black text-white">
            {authMode === 'register' ? 'إنشاء حساب في يمن ريتنغ' : 'تسجيل الدخول'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {authMode === 'register' ? 'انضم كزائر لتصفح التقييمات وإضافة منشأتك' : 'ادخل بيانات حسابك للمتابعة'}
          </p>
        </div>

        {/* أزرار التبديل */}
        <div className="flex bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-1 mb-4">
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'register'
                ? 'bg-[#FFC500] text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            إنشاء حساب جديد
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'login'
                ? 'bg-[#FFC500] text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* زر Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-850 hover:border-zinc-700 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {authMode === 'register' ? 'التسجيل السريع بواسطة Google' : 'الدخول بواسطة Google'}
        </button>

        <div className="relative flex items-center justify-center my-3.5">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 absolute">أو بالبريد الإلكتروني</span>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-3">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">الاسم الكامل *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="محمد علي"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none"
                />
                <User size={16} className="text-zinc-500 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">البريد الإلكتروني *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none"
              />
              <Mail size={16} className="text-zinc-500 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">كلمة المرور *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none"
              />
              <Lock size={16} className="text-zinc-500 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-zinc-950 text-xs font-black transition active:scale-98 disabled:opacity-50 mt-1 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جارٍ المعالجة...</span>
              </>
            ) : (
              <span>{authMode === 'register' ? 'إنشاء حساب زائر' : 'تسجيل الدخول'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
