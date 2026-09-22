'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, ShieldCheck, LogOut, Loader2, Sparkles, LogIn } from 'lucide-react';
import { OwnerRequest, UserProfile } from '../types/auth';
import { OwnerRequestModal } from '../components/account/OwnerRequestModal';
import { AuthModal } from '../components/auth/AuthModal';

export const AccountPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRequest(null);
  };

  if (loading) {
    return (
      <div className="font-['Cairo'] min-h-[50vh] flex items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC500]" />
        <span className="mr-2 text-xs font-bold text-zinc-400">جارٍ التحميل...</span>
      </div>
    );
  }

  // إذا لم يكن مسجلاً: بطاقة واحدة أنيقة بهوية يمن ريتنغ تفتح نافذة الدخول الموحدة
  if (!profile) {
    return (
      <div className="font-['Cairo'] min-h-[60vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl text-white">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-[#FFC500] border border-yellow-500/20 flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">مرحباً بك في يمن ريتنغ</h2>
            <p className="text-xs text-zinc-400 mt-1">سجل دخولك أو أنشئ حسابك لإدارة ملفك والترقية لمالك</p>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-[#FFC500] hover:bg-[#e6b200] text-zinc-950 text-xs font-black transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn size={16} />
            <span>تسجيل الدخول / إنشاء حساب</span>
          </button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => { setAuthModalOpen(false); loadData(); }}
        />
      </div>
    );
  }

  const isOwner = profile.role === 'owner';

  return (
    <div className="font-['Cairo'] py-8 px-4 sm:px-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-5">
        
        {/* معلومات الحساب */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#FFC500] flex items-center justify-center font-black text-lg">
                {profile.full_name ? profile.full_name.charAt(0) : <User size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-white">{profile.full_name || 'مستخدم يمن ريتنغ'}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isOwner ? 'bg-yellow-500/10 text-[#FFC500] border border-yellow-500/30' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {isOwner ? 'مالك منشأة' : 'حساب زائر'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{profile.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
            >
              خروج
            </button>
          </div>
        </div>

        {/* قسم المالك المعتمد */}
        {isOwner ? (
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-yellow-500/30 text-white rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFC500]" />
                حسابك: مالك منشأة معتمد
              </h2>
              <p className="text-xs text-zinc-400 mt-1">يمكنك إدارة منشآتك المربوطة ومتابعة التقييمات.</p>
            </div>
            <Link
              to="/owner"
              className="px-4 py-2.5 rounded-2xl bg-[#FFC500] text-zinc-950 text-xs font-black hover:bg-[#e6b200] transition no-underline"
            >
              بوابة المالك
            </Link>
          </div>
        ) : (
          /* قسم الزائر وطلب المالك */
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 text-white">
            <div>
              <h2 className="text-base font-black text-white">هل تملك منشأة في اليمن؟</h2>
              <p className="text-xs text-zinc-400 mt-0.5">قدم طلب ترقية حسابك إلى مالك لإدارة صفحة منشأتك عبر يمن ريتنغ.</p>
            </div>

            {request ? (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{request.business_name} ({request.business_category})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/10 text-[#FFC500] border border-yellow-500/30">
                    {request.status === 'submitted' && 'تم إرسال الطلب'}
                    {request.status === 'under_review' && 'قيد المراجعة'}
                    {request.status === 'needs_update' && 'يحتاج إلى تعديل'}
                    {request.status === 'rejected' && 'مرفوض'}
                    {request.status === 'draft' && 'مسودة'}
                  </span>
                </div>
                {request.admin_notes && (
                  <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                    ملاحظة الإدارة: {request.admin_notes}
                  </p>
                )}
                {(request.status === 'needs_update' || request.status === 'draft') && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-2 text-xs font-bold text-[#FFC500] underline cursor-pointer"
                  >
                    تعديل البيانات وإعادة الإرسال
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#FFC500] hover:bg-[#e6b200] text-zinc-950 text-xs font-black transition cursor-pointer"
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
