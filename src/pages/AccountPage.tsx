'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Mail, ShieldCheck, LogOut, Loader2, Sparkles, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OwnerRequest, UserProfile } from '../types/auth';
import { OwnerRequestModal } from '../components/account/OwnerRequestModal';

export const AccountPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // حالة التبديل بين إنشاء حساب وتسجيل الدخول
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof as UserProfile);

      const { data: req } = await supabase.from('owner_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (req) setRequest(req as OwnerRequest);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // إنشاء حساب جديد كزائر
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAuthError('يرجى كتابة الاسم الكامل');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setAuthError(error.message === 'User already registered' ? 'هذا البريد مسجل مسبقاً، يمكنك تسجيل الدخول.' : error.message);
      setAuthLoading(false);
    } else {
      if (data.session) {
        await loadData();
      } else {
        setAuthSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        setAuthMode('login');
      }
      setAuthLoading(false);
    }
  };

  // تسجيل الدخول لمن لديه حساب
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setAuthLoading(false);
    } else {
      await loadData();
    }
  };

  // تسجيل الدخول / التسجيل السريع بـ Google
  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/account',
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRequest(null);
  };

  if (loading) {
    return (
      <div className="font-['Cairo'] min-h-[50vh] flex items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <span className="mr-2 text-xs font-bold text-zinc-600">جارٍ التحميل...</span>
      </div>
    );
  }

  // إذا لم يكن مسجلاً: عرض نموذج إنشاء حساب / تسجيل الدخول
  if (!profile) {
    return (
      <div className="font-['Cairo'] min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 max-w-md w-full shadow-sm space-y-5">
          
          <div className="text-center">
            <h2 className="text-lg font-black text-zinc-900">
              {authMode === 'register' ? 'إنشاء حساب جديد في يمن ريتنغ' : 'تسجيل الدخول إلى حسابك'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {authMode === 'register' 
                ? 'أنشئ حسابك كزائر لتصفح التقييمات وإضافة منشأتك' 
                : 'ادخل بيانات حسابك للمتابعة'}
            </p>
          </div>

          {/* أزرار التبديل بين إنشاء حساب ودخول */}
          <div className="flex rounded-2xl bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(null); setAuthSuccess(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                authMode === 'register' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              إنشاء حساب جديد
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(null); setAuthSuccess(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                authMode === 'login' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* زر Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {authMode === 'register' ? 'التسجيل بواسطة Google' : 'الدخول بواسطة Google'}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-zinc-400 absolute">أو عبر البريد</span>
          </div>

          <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-3">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">الاسم الكامل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد علي"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">البريد الإلكتروني *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">كلمة المرور *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition active:scale-98 disabled:opacity-50 mt-2"
            >
              {authLoading 
                ? 'جارٍ المعالجة...' 
                : authMode === 'register' ? 'إنشاء حساب زائر الآن' : 'تسجيل الدخول'}
            </button>
          </form>

        </div>
      </div>
    );
  }

  const isOwner = profile.role === 'owner';

  return (
    <div className="font-['Cairo'] py-8 px-4 sm:px-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-5">
        
        {/* معلومات الحساب بعد التسجيل/الدخول */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg">
                {profile.full_name ? profile.full_name.charAt(0) : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-zinc-900">{profile.full_name || 'مستخدم يمن ريتنغ'}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isOwner ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {isOwner ? 'مالك منشأة' : 'حساب زائر'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{profile.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              خروج
            </button>
          </div>
        </div>

        {/* قسم المالك المعتمد */}
        {isOwner ? (
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                حسابك: مالك منشأة معتمد
              </h2>
              <p className="text-xs text-zinc-300 mt-1">يمكنك إدارة منشآتك المربوطة ومتابعة التقييمات.</p>
            </div>
            <Link
              to="/owner"
              className="px-4 py-2.5 rounded-2xl bg-amber-400 text-zinc-900 text-xs font-black hover:bg-amber-300 transition"
            >
              بوابة المالك
            </Link>
          </div>
        ) : (
          /* قسم الزائر وطلب المالك */
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-zinc-900">هل تملك منشأة في اليمن؟</h2>
              <p className="text-xs text-zinc-500 mt-0.5">قدم طلب ترقية حسابك إلى مالك لإدارة صفحة منشأتك عبر يمن ريتنغ.</p>
            </div>

            {request ? (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{request.business_name} ({request.business_category})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {request.status === 'submitted' && 'تم إرسال الطلب'}
                    {request.status === 'under_review' && 'قيد المراجعة'}
                    {request.status === 'needs_update' && 'يحتاج إلى تعديل'}
                    {request.status === 'rejected' && 'مرفوض'}
                    {request.status === 'draft' && 'مسودة'}
                  </span>
                </div>
                {request.admin_notes && (
                  <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    ملاحظة الإدارة: {request.admin_notes}
                  </p>
                )}
                {(request.status === 'needs_update' || request.status === 'draft') && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-2 text-xs font-bold text-blue-600 underline"
                  >
                    تعديل البيانات وإعادة الإرسال
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
              >
                أريد أن أصبح مالكاً
              </button>
            )}
          </div>
        )}

      </div>

      <OwnerRequestModal
        userId={profile.id}
        isOpen={modalOpen}
        existingRequest={request}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
