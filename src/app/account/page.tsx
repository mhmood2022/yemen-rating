'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Mail, Calendar, ShieldCheck, LogOut, ArrowLeft, Edit3, Loader2, Sparkles } from 'lucide-react';
import { OwnerRequest, UserProfile } from '@/types/auth';
import { OwnerRequestModal } from '@/components/account/OwnerRequestModal';

export default function AccountPage() {
  const [supabase] = useState(() => createClientComponentClient());
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50 flex items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <p className="text-xs font-bold text-zinc-600 mr-2">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50 flex items-center justify-center p-4 text-center" dir="rtl">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 max-w-sm w-full space-y-4 shadow-sm">
          <User className="w-12 h-12 text-zinc-400 mx-auto" />
          <h2 className="text-base font-black text-zinc-900">سجل الدخول لعرض حسابك</h2>
          <a href="/login" className="block w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  const isOwner = profile.role === 'owner';

  return (
    <div className="font-['Cairo'] min-h-screen bg-zinc-50/70 py-8 px-4 sm:px-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-5">
        
        {/* معلومات الحساب */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg">
                {profile.full_name ? profile.full_name.charAt(0) : <User className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-zinc-900">{profile.full_name || 'مستخدم يمن ريتنغ'}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isOwner ? 'bg-amber-100 text-amber-900' : 'bg-zinc-100 text-zinc-700'}`}>
                    {isOwner ? 'مالك منشأة' : 'حساب زائر'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{profile.email}</p>
              </div>
            </div>

            <button onClick={handleSignOut} className="px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50">
              خروج
            </button>
          </div>
        </div>

        {/* قسم المالك المعتمد */}
        {isOwner ? (
          <div className="bg-zinc-900 text-white rounded-3xl p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                حساب مالك معتمد
              </h2>
              <p className="text-xs text-zinc-300 mt-1">يمكنك إدارة منشآتك واستقبال تقييمات الزوار.</p>
            </div>
            <Link href="/owner" className="px-4 py-2.5 rounded-xl bg-amber-400 text-zinc-900 text-xs font-black">
              لوحة المالك
            </Link>
          </div>
        ) : (
          /* قسم الزائر وطلب المالك */
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-zinc-900">هل تملك منشأة في اليمن؟</h2>
              <p className="text-xs text-zinc-500 mt-0.5">قدم طلب ترقية حسابك إلى مالك لإدارة صفحة منشأتك على الموقع.</p>
            </div>

            {request ? (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{request.business_name} ({request.business_category})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {request.status === 'submitted' && 'تم إرسال الطلب'}
                    {request.status === 'under_review' && 'قيد المراجعة'}
                    {request.status === 'needs_update' && 'يحتاج إلى تعديل'}
                    {request.status === 'rejected' && 'مرفوض'}
                  </span>
                </div>
                {request.admin_notes && (
                  <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-xl">ملاحظة الإدارة: {request.admin_notes}</p>
                )}
                {(request.status === 'needs_update' || request.status === 'draft') && (
                  <button onClick={() => setModalOpen(true)} className="mt-2 text-xs font-bold text-blue-600 underline">
                    تعديل البيانات وإعادة الإرسال
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => setModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition">
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
}
