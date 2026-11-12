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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
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

    if (!fullName.trim()) { setNameError('الاسم مطلوب'); setEmailError(null); setPasswordError(null); return; }
    if (!email.trim()) { setEmailError('البريد الإلكتروني مطلوب'); setNameError(null); setPasswordError(null); return; }
    if (!password.trim()) { setPasswordError('كلمة المرور مطلوبة'); setNameError(null); setEmailError(null); return; }
    setNameError(null); setEmailError(null); setPasswordError(null);


    if (!email.trim()) { setEmailError('يرجى إدخال البريد الإلكتروني'); setPasswordError(null); return; }
    if (!password.trim()) { setPasswordError('يرجى إدخال كلمة المرور'); setEmailError(null); return; }
    setEmailError(null);
    setPasswordError(null);

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

    if (!email.trim()) { setEmailError('يرجى إدخال البريد الإلكتروني'); setPasswordError(null); return; }
    if (!password.trim()) { setPasswordError('يرجى إدخال كلمة المرور'); setEmailError(null); return; }
    setEmailError(null);
    setPasswordError(null);

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
        className="relative w-full max-w-[420px] bg-black border border-[#2F3336] rounded-[32px] p-6 sm:p-7 shadow-[0_10px_50px_rgba(0,0,0,0.8)] text-white overflow-hidden"
      >
        

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
          <img src="/yr-logo.png" alt="Yemen Rating" className="w-20 h-20 object-contain" />
        </div>

        {/* العنوان والخطوط الجانبية */}
        <div className="flex items-center gap-3 my-3.5 relative z-10">
          <div className="h-[1px] bg-zinc-700/60 flex-1" />
          <h2 className="text-sm sm:text-base font-black text-white whitespace-nowrap tracking-wide">
            مرحباً <span className="text-white">بك</span> في منصة يمن ريتنغ
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
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#16181C] border border-[#333639] text-[#E7E9EA] hover:bg-[#1f2326]'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 ${
                authMode === 'register'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#16181C] border border-[#333639] text-[#E7E9EA] hover:bg-[#1f2326]'
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
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg bg-black hover:bg-white/5 border border-black text-white text-xs sm:text-sm font-bold transition active:scale-[0.99]"
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
                <input type="text"  placeholder="username" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#16181C] border border-[#333639] text-xs text-white placeholder-[#71767B] focus:border-white focus:outline-none transition"
                />
                <User size={16} className="text-zinc-500 absolute right-3.5 top-3" />
              </div>
            {nameError && (
              <p className="text-xs text-red-500 mt-1 pr-1">{nameError}</p>
            )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-white mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <input type="email" placeholder="example@domain.com" value={email} onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  if (val) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                    if (!emailRegex.test(val.trim())) {
                      setEmailError('البريد الإلكتروني غير صحيح (مثال: name@example.com)');
                    } else {
                      setEmailError(null);
                    }
                  } else {
                    setEmailError(null);
                  }
                }}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#16181C] border text-xs text-white placeholder-[#71767B] focus:outline-none transition ${
                  emailError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#333639] focus:border-white'
                }`}
              />
              <Mail size={16} className="text-zinc-500 absolute right-3.5 top-3" />
            </div>
            {emailError && (
              <p className="text-[10px] text-red-400 mt-1 pr-1">{emailError}</p>
            )}
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-white">كلمة المرور</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-xs font-bold text-white hover:underline transition"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'}  placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-10 py-2.5 pr-10 rounded-lg bg-[#16181C] border border-[#333639] text-xs text-white placeholder-[#71767B] focus:border-white focus:outline-none transition"
                />
                <Lock size={16} className="text-zinc-500 absolute right-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3 text-zinc-500 hover:text-white focus:outline-none transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
                {passwordError && (
                  <p className="text-[10px] text-red-400 mt-1 pr-1">{passwordError}</p>
                )}
              </div>
          )}


          {/* الزر الرئيسي الأصفر العريض المطابق للصورة */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#E7E9EA] active:scale-[0.99] text-black text-sm font-black transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
