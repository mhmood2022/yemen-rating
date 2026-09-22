'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, ShieldCheck, LogOut, ArrowLeft, Edit3, Loader2, Sparkles } from 'lucide-react';
import { OwnerRequest, UserProfile } from '../types/auth';
import { OwnerRequestModal } from '../components/account/OwnerRequestModal';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // حقول تسجيل الدخول البسيط إذا لم يكن مسجلاً
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setAuthLoading(false);
    } else {
      await loadData();
    }
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

  // إذا لم يكن مسجلاً الدخول
  if (!profile) {
    return (
      <div className="font-['Cairo'] min-h-[60vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 max-w-sm w-full shadow-sm space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-700">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-zinc-900">تسجيل الدخول إلى حسابك</h2>
            <p className="text-xs text-zinc-500 mt-0.5">ادخل بريدك لمتابعة حسابك أو طلب ترقية المالك</p>
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              required
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
            />
            <input
              type="password"
              required
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {authLoading ? 'جارٍ التحقق...' : 'دخول'}
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
        
        {/* معلومات الحساب */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg">
                {profile.full_name ? profile.full_name.charAt(0) : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-zinc-900">{profile.full_name || 'مستخدم يمن ريتنغ'}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isOwner ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-zinc-100 text-zinc-700'}`}>
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

        {/* قسم المالك إذا كان حسابه Owner */}
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
