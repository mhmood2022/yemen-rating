'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Mail, Phone, Calendar, ShieldCheck, LogOut, 
  Loader2, Sparkles, Building2, Save, Edit3, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { OwnerRequest, UserProfile } from '../types/auth';
import { OwnerRequestModal } from '../components/account/OwnerRequestModal';
import { AuthModal } from '../components/auth/AuthModal';

export const AccountPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [request, setRequest] = useState<OwnerRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // تعديل البيانات الشخصية
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      if (prof) {
        setProfile(prof as UserProfile);
        setEditName(prof.full_name || '');
        setEditPhone(prof.phone || '');
      }

      const { data: req } = await supabase.from('owner_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (req) setRequest(req as OwnerRequest);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // حفظ تعديل الاسم ورقم الهاتف
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim(), phone: editPhone.trim() })
      .eq('id', profile.id);

    setSavingProfile(false);
    if (!error) {
      setSaveSuccess(true);
      setIsEditing(false);
      await loadData();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRequest(null);
  };

  if (loading) {
    return (
      <div className="font-['Cairo',sans-serif] min-h-[50vh] flex items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC500]" />
        <span className="mr-2 text-xs font-bold text-zinc-400">جارٍ تحميل الملف الشخصي...</span>
      </div>
    );
  }

  // إذا لم يكن مسجلاً
  if (!profile) {
    return (
      <div className="font-['Cairo',sans-serif] min-h-[60vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl text-white">
          <div className="w-14 h-14 rounded-2xl bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20 flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">مرحباً بك في يمن ريتنغ</h2>
            <p className="text-xs text-zinc-400 mt-1">سجل دخولك أو أنشئ حسابك لإدارة ملفك الشخصي</p>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black transition active:scale-95 cursor-pointer shadow-sm"
          >
            تسجيل الدخول / إنشاء حساب
          </button>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); loadData(); }} />
      </div>
    );
  }

  const isOwner = profile.role === 'owner';

  return (
    <div className="font-['Cairo',sans-serif] py-8 px-4 sm:px-6 text-white" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* 1. رأس الملف الشخصي (Profile Hero) الفاخر */}
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#060913] border-2 border-[#FFC500]/30 text-[#FFC500] flex items-center justify-center font-black text-2xl shrink-0 shadow-inner">
                {profile.full_name ? profile.full_name.charAt(0) : <User size={28} />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-black text-white">{profile.full_name || 'مستخدم يمن ريتنغ'}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isOwner ? 'bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/30' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {isOwner ? 'مالك منشأة معتمد' : 'حساب زائر'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#FFC500]" />
                  <span>{profile.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-2 rounded-xl border border-[#1e293b] bg-[#060913] hover:border-[#FFC500]/50 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl border border-[#1e293b] text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* تفاصيل إضافية في رأس البروفايل */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 mt-5 border-t border-[#1e293b] text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#FFC500]" />
              <span>انضم في: {new Date(profile.created_at).toLocaleDateString('ar-YE')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>حالة الحساب: نشط</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-[#FFC500]" />
                <span dir="ltr">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* نموذج تعديل البيانات الشخصية إن فُعّل */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 space-y-3 animate-in fade-in">
            <h3 className="text-xs font-black text-white mb-2">تحديث بيانات الملف الشخصي</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">رقم الهاتف الشخصي</label>
                <input
                  type="text"
                  placeholder="777000000"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingProfile}
                className="h-9 px-4 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#eab308] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{savingProfile ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>تم تحديث بيانات ملفك الشخصي بنجاح!</span>
          </div>
        )}

        {/* 2. قسم المالك المعتمد أو الترقية لمالك */}
        {isOwner ? (
          <div className="bg-gradient-to-r from-[#0a0f1d] to-[#0d1527] border border-[#FFC500]/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <h2 className="text-base font-black flex items-center gap-2 text-white">
                <Sparkles size={18} className="text-[#FFC500]" />
                أنت مالك معتمد في يمن ريتنغ
              </h2>
              <p className="text-xs text-zinc-400">
                لديك صلاحيات كاملة لإدارة منشأتك، الرد على التقييمات، ومتابعة الإحصائيات.
              </p>
            </div>

            <Link
              to="/owner"
              className="h-11 px-5 rounded-2xl bg-[#FFC500] hover:bg-[#eab308] text-black font-black text-xs flex items-center justify-center gap-2 transition shrink-0 no-underline shadow-md"
            >
              <span>لوحة تحكم المالك</span>
              <ArrowRight size={15} className="rotate-180" />
            </Link>
          </div>
        ) : (
          /* قسم الترقية لمالك منشأة مصمم بهيبة وأناقة */
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFC500]/10 border border-[#FFC500]/20 text-[#FFC500] flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white">ترقية الحساب إلى «مالك منشأة»</h2>
                <p className="text-xs text-zinc-400">امتلك صفحة منشأتك الرسمية وأدر تقييماتك في يمن ريتنغ</p>
              </div>
            </div>

            {/* حالة الطلب الحالي إن وُجد */}
            {request ? (
              <div className="p-4 rounded-2xl bg-[#060913] border border-[#1e293b] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{request.business_name} ({request.business_category})</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    request.status === 'needs_update' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    request.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    'bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/30'
                  }`}>
                    {request.status === 'submitted' && 'تم إرسال الطلب (قيد الانتظار)'}
                    {request.status === 'under_review' && 'قيد المراجعة لدى الإدارة'}
                    {request.status === 'needs_update' && 'يحتاج إلى تعديل'}
                    {request.status === 'rejected' && 'تم رفض الطلب'}
                    {request.status === 'draft' && 'مسودة لم ترسل'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  المدينة: {request.city} • تم التقديم في: {new Date(request.created_at).toLocaleDateString('ar-YE')}
                </p>

                {request.admin_notes && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                    <strong className="block mb-0.5">ملاحظة الإدارة:</strong>
                    <span>{request.admin_notes}</span>
                  </div>
                )}

                {(request.status === 'needs_update' || request.status === 'draft') && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-1 h-9 px-4 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#eab308] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>تعديل الطلب وإعادة الإرسال</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#060913] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  هل تدير فندقاً، بنكاً، كافيه، مستشفى، معرضاً أو شركة؟ قدم طلبك ليتم اعتماده وتفعيل صفحة المالك.
                </p>

                <button
                  onClick={() => setModalOpen(true)}
                  className="h-10 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black font-black text-xs transition cursor-pointer shrink-0 shadow-sm"
                >
                  أريد أن أصبح مالكاً
                </button>
              </div>
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
