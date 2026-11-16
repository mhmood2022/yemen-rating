'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  X, User, Mail, Lock, AlertCircle, CheckCircle2, 
  Loader2, Eye, EyeOff, KeyRound, ArrowRight 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'register' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'forgot'>(defaultMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // إنشاء حساب جديد
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('يرجى كتابة الاسم الكامل');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

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
        setSuccessMsg('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول مباشرة.');
        setAuthMode('login');
      }
      setLoading(false);
    }
  };

  // تسجيل الدخول المحمي والذكي
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // تفريغ أي ذاكرة زائدة قبل تسجيل الدخول لضمان مساحة لرمز الجلسة
      const allKeys = Object.keys(localStorage);
      for (const k of allKeys) {
        if (k.startsWith('yr_x_') || (k === 'yr_community_global_posts' && (localStorage.getItem(k)?.length || 0) > 1000000)) {
          localStorage.removeItem(k);
        }
      }
    } catch (_) {}

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Login error from Supabase:", error);
        if (error.message.includes('Email not confirmed')) {
          setErrorMsg('يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إلى صندوق الوارد/الرسائل غير المرغوب فيها.');
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('كلمة المرور أو البريد الإلكتروني غير صحيح. يرجى التأكد من كلمة المرور.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data?.session) {
        setSuccessMsg('تم تسجيل الدخول بنجاح! جاري التوجيه...');
        setTimeout(() => {
          onClose();
          navigate('/account');
          window.location.reload();
        }, 400);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'حدث خطأ في الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false); // يضمن إيقاف التعليق دائماً!
    }
  };

  // استعادة كلمة المرور
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) {
      setErrorMsg(error.message || 'تعذر إرسال رابط الاستعادة، تأكد من صحة البريد.');
    } else {
      setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك بنجاح.');
    }
    setLoading(false);
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
      className="fixed inset-0 z-[100] bg-black  flex items-center justify-center p-3 sm:p-4 font-['Tahoma',sans-serif] animate-fade-in"
      dir="rtl"
    >
      {/* البطاقة المطابقة تماماً للصورة */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-[#060C1B] border border-blue-950/60 rounded-[32px] p-6 sm:p-7 shadow-[0_10px_50px_rgba(0,0,0,0.8)] text-white overflow-hidden"
      >
        {/* الخطوط الموجية الزرقاء في الخلفية */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30" 
          viewBox="0 0 420 600" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <path d="M-50 150 C100 50, 250 250, 470 120" stroke="#1E3A8A" strokeWidth="2.5" />
          <path d="M-30 200 C150 100, 270 290, 480 180" stroke="#1D4ED8" strokeWidth="1.8" />
          <path d="M-60 260 C120 180, 280 340, 490 240" stroke="#1E3A8A" strokeWidth="1.2" />
        </svg>

        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 left-5 text-zinc-400 hover:text-white transition-colors z-20"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        {/* الشعار: الدرع الملكي مع النجمة والقوس الذهبي */}
        <div className="flex justify-center pt-1 mb-2 relative z-10">
          <svg className="w-20 h-20 drop-shadow-[0_4px_15px_rgba(245,184,0,0.3)]" viewBox="0 0 100 100" fill="none">
            {/* الدرع الخارجي الأبيض/الفضي */}
            <path 
              d="M50 10 L82 23 V48 C82 69 50 90 50 90 C50 90 18 69 18 48 V23 Z" 
              fill="#060C1B" 
              stroke="#FFFFFF" 
              strokeWidth="4" 
              strokeLinejoin="round" 
            />
            {/* القوس الذهبي المحيط بالنجمة */}
            <path 
              d="M26 62 C34 76 66 78 75 58 C66 70 36 71 26 62 Z" 
              fill="#F5B800" 
            />
            {/* النجمة الذهبية في الوسط */}
            <path 
              d="M50 28 L54.5 39.5 H67 L57.2 47.5 L60.8 59.5 L50 52 L39.2 59.5 L42.8 47.5 L33 39.5 H45.5 Z" 
              fill="#F5B800" 
            />
          </svg>
        </div>

        {/* العنوان والخطوط الجانبية */}
        <div className="flex items-center gap-3 my-3.5 relative z-10">
          <div className="h-[1px] bg-zinc-700/60 flex-1" />
          <h2 className="text-sm sm:text-base font-black text-white whitespace-nowrap tracking-wide">
            مرحباً <span className="text-[#F5B800]">بك</span> في منصة يمن ريتنغ
          </h2>
          <div className="h-[1px] bg-zinc-700/60 flex-1" />
        </div>

        {/* أزرار التبديل الكبسولية المطابقة */}
        {authMode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2.5 mb-3.5 relative z-10">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 ${
                authMode === 'login'
                  ? 'bg-[#F5B800] text-black shadow-md'
                  : 'bg-[#141E30] text-zinc-300 border border-[#263750] hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 ${
                authMode === 'register'
                  ? 'bg-[#F5B800] text-black shadow-md'
                  : 'bg-[#141E30] text-zinc-300 border border-[#263750] hover:text-white'
              }`}
            >
              حساب جديد
            </button>
          </div>
        )}

        {/* زر Google الأخضر الداكن المخصص */}
        {authMode !== 'forgot' && (
          <div className="relative z-10 mb-3.5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg bg-[#006020] hover:bg-[#037027] border border-[#0e7e34] text-white text-xs sm:text-sm font-bold transition shadow-sm active:scale-[0.99]"
            >
              <span>المتابعة عبر حساب Google</span>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>
          </div>
        )}

        {/* فاصل أو عبر البريد الإلكتروني */}
        {authMode !== 'forgot' && (
          <div className="flex items-center gap-3 my-3 relative z-10">
            <div className="h-[1px] bg-zinc-800 flex-1" />
            <span className="text-[11px] text-zinc-400 font-medium">أو عبر البريد الإلكتروني</span>
            <div className="h-[1px] bg-zinc-800 flex-1" />
          </div>
        )}

        {/* رسائل الخطأ والنجاح */}
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-bold relative z-10">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold relative z-10">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* نموذج الإدخال */}
        <form 
          onSubmit={
            authMode === 'register' 
              ? handleRegister 
              : authMode === 'login' 
                ? handleLogin 
                : handleResetPassword
          } 
          className="space-y-3 relative z-10 text-right"
        >
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="محمد عبدالله"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#101928] border border-[#263750] text-xs text-white placeholder-zinc-500 focus:border-[#F5B800] focus:outline-none transition"
                />
                <User size={16} className="text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-white mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#101928] border border-[#263750] text-xs text-white placeholder-zinc-500 focus:border-[#F5B800] focus:outline-none transition"
              />
              <Mail size={16} className="text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-white">كلمة المرور</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-xs font-bold text-[#F5B800] hover:underline transition"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-10 py-2.5 pr-10 rounded-lg bg-[#101928] border border-[#263750] text-xs text-white placeholder-zinc-500 focus:border-[#F5B800] focus:outline-none transition"
                />
                <Lock size={16} className="text-zinc-500 absolute right-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* الزر الرئيسي الأصفر العريض المطابق للصورة */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#F5B800] hover:bg-[#E5AC00] active:scale-[0.99] text-black text-sm font-black transition shadow-[0_4px_20px_rgba(245,184,0,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-black" />
            ) : (
              <span>
                {authMode === 'register' && 'إنشاء حساب جديد'}
                {authMode === 'login' && 'تسجيل الدخول'}
                {authMode === 'forgot' && 'إرسال رابط الاستعادة'}
              </span>
            )}
          </button>
        </form>

        {/* العودة لتسجيل الدخول عند وضع الاستعادة */}
        {authMode === 'forgot' && (
          <div className="mt-4 text-center relative z-10">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="text-xs text-zinc-400 hover:text-white font-bold inline-flex items-center gap-1.5 transition"
            >
              <ArrowRight size={14} />
              <span>العودة لتسجيل الدخول</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
