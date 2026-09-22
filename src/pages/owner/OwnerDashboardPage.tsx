'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Plus, Star, MapPin, Phone, Globe, Clock, ShieldCheck, 
  Sparkles, ExternalLink, Settings2, ArrowRight, Save, Eye, 
  MessageSquare, Loader2, AlertCircle, CheckCircle2, User 
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { OwnerRequestModal } from '../../components/account/OwnerRequestModal';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  
  // المنشأة المحددة للإدارة المصغرة
  const [managingBiz, setManagingBiz] = useState<any | null>(null);
  const [manageTab, setManageTab] = useState<'overview' | 'details' | 'reviews' | 'visibility' | 'promote'>('overview');
  const [reviews, setReviews] = useState<any[]>([]);
  
  // بيانات التعديل
  const [editForm, setEditForm] = useState({
    phone: '',
    whatsapp: '',
    website: '',
    working_hours: '',
    description: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // نافذة إضافة منشأة جديدة
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/account');
        return;
      }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof as UserProfile);

      // جلب منشآت هذا المالك فقط من قاعدة البيانات
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setBusinesses(bizData || []);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // فتح الإدارة المصغرة لمنشأة معينة
  const handleOpenManage = async (biz: any) => {
    setManagingBiz(biz);
    setEditForm({
      phone: biz.phone || '',
      whatsapp: biz.whatsapp || '',
      website: biz.website || '',
      working_hours: biz.working_hours || '',
      description: biz.description || '',
      address: biz.address || '',
    });

    // جلب تقييمات المنشأة الحقيقية
    const { data: revData } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', biz.id)
      .order('created_at', { ascending: false });

    setReviews(revData || []);
  };

  // حفظ تعديلات المنشأة في قاعدة البيانات
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingBiz || !profile) return;
    setSaving(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from('businesses')
      .update({
        phone: editForm.phone.trim(),
        whatsapp: editForm.whatsapp.trim(),
        website: editForm.website.trim(),
        working_hours: editForm.working_hours.trim(),
        description: editForm.description.trim(),
        address: editForm.address.trim(),
      })
      .eq('id', managingBiz.id)
      .eq('owner_id', profile.id);

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      await loadData();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="font-['Cairo',sans-serif] min-h-[60vh] flex items-center justify-center p-4 text-white" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC500]" />
        <span className="mr-2 text-xs font-bold text-zinc-400">جارٍ تحميل لوحة المالك...</span>
      </div>
    );
  }

  // حماية المسار: إذا كان الحساب زائر وليس مالك معتمد
  if (profile?.role !== 'owner') {
    return (
      <div className="font-['Cairo',sans-serif] min-h-[65vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl text-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#FFC500] border border-amber-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">هذه البوابة مخصصة لملاك المنشآت فقط</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              حسابك الحالي مسجل كـ «زائر». للوصول إلى لوحة المالك، يرجى تقديم طلب ترقية حسابك من صفحة البروفايل ليتم اعتماده من الإدارة.
            </p>
          </div>
          <Link
            to="/account"
            className="inline-block w-full py-3 rounded-2xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black transition cursor-pointer no-underline shadow-sm"
          >
            الذهاب لصفحة الحساب وتقديم الطلب
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // شاشة الإدارة المصغرة للمنشأة المحددة
  // ----------------------------------------------------
  if (managingBiz) {
    return (
      <div className="font-['Cairo',sans-serif] py-6 px-4 sm:px-6 text-white max-w-4xl mx-auto space-y-5" dir="rtl">
        
        {/* شريط الإدارة العلوي والرجوع */}
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManagingBiz(null)}
              className="p-2 rounded-xl bg-[#060913] border border-[#1e293b] hover:border-[#FFC500] text-zinc-300 hover:text-white transition cursor-pointer"
              title="رجوع لقائمة منشآتي"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">{managingBiz.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-[#FFC500]/10 text-[#FFC500] text-[10px] font-bold border border-[#FFC500]/20">
                  {managingBiz.category || 'منشأة معتمدة'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{managingBiz.city} • إدارة المنشأة المصغرة</p>
            </div>
          </div>

          <a
            href={`/businesses/${managingBiz.id || managingBiz.slug}`}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 rounded-xl border border-[#1e293b] bg-[#060913] hover:border-[#FFC500]/50 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer no-underline"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">الصفحة العامة</span>
          </a>
        </div>

        {/* تبويبات الإدارة المصغرة */}
        <div className="flex gap-1.5 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Eye },
            { id: 'details', label: 'تعديل البيانات', icon: Settings2 },
            { id: 'reviews', label: 'التقييمات', icon: Star },
            { id: 'promote', label: 'الترويج والشارات', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = manageTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setManageTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected ? 'bg-[#FFC500] text-black font-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>تم حفظ تعديلات المنشأة بنجاح!</span>
          </div>
        )}

        {/* 1. نظرة عامة */}
        {manageTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-400">التقييم العام</span>
                <p className="text-xl font-black text-[#FFC500] mt-1 flex items-center gap-1">
                  <Star size={16} className="fill-current" />
                  <span>{managingBiz.rating ? Number(managingBiz.rating).toFixed(1) : 'غير متوفر'}</span>
                </p>
              </div>

              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-400">عدد التقييمات الحقيقي</span>
                <p className="text-xl font-black text-white mt-1">
                  {managingBiz.reviews_count || reviews.length || 0}
                </p>
              </div>

              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[11px] text-zinc-400">حالة الظهور في الدليل</span>
                <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>نشطة وموثقة للجمهور</span>
                </p>
              </div>
            </div>

            <div className="bg-[#0a0f1d] border border-[#1e293b] p-5 rounded-2xl space-y-2">
              <h3 className="text-xs font-black text-white">نبذة المنشأة الحالية:</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {managingBiz.description || 'لم يتم إضافة وصف تعريفي بعد. يمكنك إضافته من تبويب (تعديل البيانات).'}
              </p>
            </div>
          </div>
        )}

        {/* 2. تعديل البيانات المسموحة */}
        {manageTab === 'details' && (
          <form onSubmit={handleSaveBusiness} className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 sm:p-6 space-y-3.5">
            <h2 className="text-xs font-black text-white border-b border-[#1e293b] pb-2">
              تعديل بيانات التواصل والخدمات
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">رقم الهاتف / الاتصال</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                  placeholder="777000000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">رقم الواتساب</label>
                <input
                  type="text"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                  placeholder="967777000000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">أوقات وساعات الدوام</label>
                <input
                  type="text"
                  value={editForm.working_hours}
                  onChange={(e) => setEditForm({ ...editForm, working_hours: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                  placeholder="مثال: من 8:00 ص إلى 10:00 م"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">الموقع الإلكتروني / رابط</label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                  placeholder="https://example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">العنوان التفصيلي</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                placeholder="الشارع، الحي، بجانب معلم معروف..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">نبذة تعريفية عن المنشأة والخدمات</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white focus:border-[#FFC500] focus:outline-none resize-none"
                placeholder="اكتب وصفاً جذاباً يشرح خدمات منشأتك ومميزاتها للزوار..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. التقييمات والمراجعات */}
        {manageTab === 'reviews' && (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <h2 className="text-xs font-black text-white">تقييمات ومراجعات العملاء الحقيقية</h2>
              <span className="text-[11px] text-[#FFC500] font-bold">{reviews.length} تقييم</span>
            </div>

            {reviews.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-bold">
                لا توجد تقييمات مسجلة لهذه المنشأة حتى الآن في يمن ريتنغ.
              </div>
            ) : (
              <div className="divide-y divide-[#1e293b]">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rev.user_name || 'عميل'}</span>
                      <div className="flex items-center gap-1 text-[#FFC500]">
                        <Star size={12} className="fill-current" />
                        <span className="text-xs font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300">{rev.comment}</p>
                    <span className="text-[10px] text-zinc-500">{new Date(rev.created_at).toLocaleDateString('ar-YE')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. الترويج */}
        {manageTab === 'promote' && (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20 flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h2 className="text-sm font-black text-white">ترقية وتمييز صفحة المنشأة</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              احصل على شارة التميز الذهبية وظهور متصدر في نتائج البحث لتصنيف ({managingBiz.category}) في {managingBiz.city}.
            </p>
            <div className="pt-2">
              <Link
                to="/prices"
                className="inline-block py-2.5 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black no-underline transition"
              >
                الاطلاع على باقات الترويج والاشتراكات
              </Link>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ----------------------------------------------------
  // شاشة المالك الرئيسية: "منشآتي"
  // ----------------------------------------------------
  return (
    <div className="font-['Cairo',sans-serif] py-8 px-4 sm:px-6 text-white max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* 1. رأس لوحة المالك */}
      <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#060913] border-2 border-[#FFC500]/40 text-[#FFC500] flex items-center justify-center font-black text-xl shrink-0">
            {profile.full_name ? profile.full_name.charAt(0) : <User size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">{profile.full_name || 'المالك'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/30">
                مالك معتمد
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{profile.email} • مركز إدارة المنشآت الموحد</p>
          </div>
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>طلب إضافة منشأة</span>
        </button>
      </div>

      {/* 2. قسم "منشآتي" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white">منشآتي المعتمدة</h2>
            <p className="text-[11px] text-zinc-400">جميع المنشآت المربوطة بحسابك تحت إدارتك المباشرة</p>
          </div>
          <span className="text-xs font-bold text-zinc-400 bg-[#0a0f1d] border border-[#1e293b] px-3 py-1 rounded-xl">
            {businesses.length} منشأة
          </span>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#060913] border border-[#1e293b] text-zinc-500 flex items-center justify-center mx-auto">
              <Building2 size={24} />
            </div>
            <h3 className="text-sm font-black text-white">لا توجد منشآت مربوطة بحسابك حتى الآن</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              إذا وافقت الإدارة على طلبك فستظهر منشأتك هنا فوراً، أو يمكنك تقديم طلب إضافة منشأة جديدة الآن.
            </p>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="mt-2 h-10 px-5 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#eab308] transition cursor-pointer"
            >
              تقديم طلب منشأة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-[#0a0f1d] border border-[#1e293b] hover:border-[#FFC500]/40 rounded-3xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20">
                      {biz.category || 'عام'}
                    </span>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <MapPin size={12} className="text-[#FFC500]" />
                      <span>{biz.city}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white mb-1.5 line-clamp-1">{biz.name}</h3>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 text-[#FFC500] font-bold">
                      <Star size={13} className="fill-current" />
                      <span>{biz.rating ? Number(biz.rating).toFixed(1) : '0.0'}</span>
                    </span>
                    <span>({biz.reviews_count || 0} تقييم)</span>
                  </div>
                </div>

                {/* زران رئيسيان: إدارة المنشأة وعرض المنشأة */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e293b]">
                  <button
                    onClick={() => handleOpenManage(biz)}
                    className="h-9 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Settings2 size={14} />
                    <span>إدارة المنشأة</span>
                  </button>

                  <a
                    href={`/businesses/${biz.id || biz.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 rounded-xl border border-[#1e293b] bg-[#060913] hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer no-underline"
                  >
                    <ExternalLink size={13} />
                    <span>عرض المنشأة</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OwnerRequestModal
        userId={profile.id}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
export default OwnerDashboardPage;
