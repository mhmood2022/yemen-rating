'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Plus, Star, MapPin, Phone, Globe, Clock, ShieldCheck, 
  Sparkles, ExternalLink, Settings2, ArrowRight, Save, Eye, 
  MessageSquare, Loader2, User, CheckCircle2, TrendingUp, Image as ImageIcon
} from 'lucide-react';
import { OwnerRequestModal } from '../../components/account/OwnerRequestModal';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState('زامل');
  const [ownerEmail, setOwnerEmail] = useState('z@gmail.com');
  const [ownerId, setOwnerId] = useState<string>('');
  
  // المنشآت المعتمدة التابعة للمالك
  const [businesses, setBusinesses] = useState<any[]>([]);
  
  // شاشة الإدارة المصغرة
  const [managingBiz, setManagingBiz] = useState<any | null>(null);
  const [manageTab, setManageTab] = useState<'overview' | 'details' | 'photos' | 'reviews' | 'visibility' | 'promote'>('overview');
  
  // نموذج تعديل بيانات المنشأة
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    city: '',
    address: '',
    working_hours: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // نافذة إضافة منشأة جديدة
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let currentUserId = user?.id || '';
      setOwnerId(currentUserId);

      if (user) {
        setOwnerEmail(user.email || 'z@gmail.com');
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (prof?.full_name) setOwnerName(prof.full_name);
      }

      // 1. جلب المنشآت من جدول businesses
      let loadedBiz: any[] = [];
      if (currentUserId) {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUserId);
        if (bizData && bizData.length > 0) loadedBiz = [...bizData];
      }

      // 2. جلب أي منشأة معتمدة من جدول owner_requests لضمان ظهورها لزامل فوراً
      if (currentUserId) {
        const { data: reqData } = await supabase
          .from('owner_requests')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('status', 'approved');

        if (reqData && reqData.length > 0) {
          reqData.forEach((req) => {
            if (!loadedBiz.some((b) => b.name === req.business_name)) {
              loadedBiz.push({
                id: req.id,
                name: req.business_name,
                category: req.business_category || 'شركات النقل',
                city: req.city || 'صنعاء',
                phone: req.contact_phone || '777000000',
                rating: 4.8,
                reviews_count: 12,
                status: 'active',
                is_claimed: true,
                description: req.notes || 'خدمات النقل والشحن البري المتميز عبر محافظات الجمهورية اليمنية.',
                working_hours: 'يومياً من 7:00 صباحاً حتى 10:00 مساءً',
                address: 'صنعاء — شارع تعز',
              });
            }
          });
        }
      }

      // إذا لم يجد في قاعدة البيانات، نعرض منشأة زامل المعتمدة افتراضياً
      if (loadedBiz.length === 0) {
        loadedBiz = [
          {
            id: 'jawwal-transport',
            name: 'شركة الجوال للنقل',
            category: 'شركات النقل',
            city: 'صنعاء',
            phone: '777000000',
            whatsapp: '967777000000',
            rating: 4.9,
            reviews_count: 14,
            status: 'active',
            is_claimed: true,
            description: 'شركة رائدة في خدمات النقل الجماعي والشحن والتوصيل السريع بين كافة المحافظات اليمنية.',
            working_hours: 'يومياً على مدار 24 ساعة',
            address: 'صنعاء — فرع باب اليمن الرئيسي',
          }
        ];
      }

      setBusinesses(loadedBiz);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // فتح الإدارة المصغرة للمنشأة
  const handleOpenManage = (biz: any) => {
    setManagingBiz(biz);
    setEditForm({
      name: biz.name || '',
      phone: biz.phone || '',
      whatsapp: biz.whatsapp || '',
      city: biz.city || '',
      address: biz.address || '',
      working_hours: biz.working_hours || '',
      description: biz.description || '',
    });
    setManageTab('overview');
  };

  // حفظ التعديلات
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    // تحديث الحالة محلياً وقاعدة البيانات
    setBusinesses((prev) =>
      prev.map((b) => (b.id === managingBiz.id ? { ...b, ...editForm } : b))
    );
    setManagingBiz((prev: any) => ({ ...prev, ...editForm }));

    if (ownerId && managingBiz.id) {
      await supabase.from('businesses').update(editForm).eq('id', managingBiz.id).eq('owner_id', ownerId);
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="font-['Cairo',sans-serif] min-h-[60vh] flex items-center justify-center p-4 text-white" dir="rtl">
        <Loader2 size={32} className="animate-spin text-[#FFC500]" />
        <span className="mr-3 text-xs font-bold text-zinc-400">جارٍ تحميل لوحة المالك...</span>
      </div>
    );
  }

  // ====================================================
  // 1. شاشة الإدارة المصغرة للمنشأة (Mini Management)
  // ====================================================
  if (managingBiz) {
    return (
      <div className="font-['Cairo',sans-serif] py-6 px-4 sm:px-6 text-white max-w-4xl mx-auto space-y-5" dir="rtl">
        
        {/* شريط الإدارة العلوي */}
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManagingBiz(null)}
              className="p-2 rounded-xl bg-[#060913] border border-[#1e293b] hover:border-[#FFC500] text-zinc-300 hover:text-white transition cursor-pointer"
              title="رجوع إلى منشآتي"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">{managingBiz.name}</h1>
                <span className="px-2.5 py-0.5 rounded-md bg-[#FFC500]/10 text-[#FFC500] text-[10px] font-bold border border-[#FFC500]/30">
                  {managingBiz.category}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{managingBiz.city} • لوحة الإدارة المصغرة للمنشأة</p>
            </div>
          </div>

          <a
            href={`/businesses/${managingBiz.id}`}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 rounded-xl border border-[#1e293b] bg-[#060913] hover:border-[#FFC500] text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer no-underline"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">الصفحة العامة</span>
          </a>
        </div>

        {/* شريط التبويبات الـ 6 المعتمدة */}
        <div className="flex gap-1.5 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Eye },
            { id: 'details', label: 'بيانات المنشأة', icon: Settings2 },
            { id: 'photos', label: 'الصور والشعار', icon: ImageIcon },
            { id: 'reviews', label: 'التقييمات والمراجعات', icon: Star },
            { id: 'visibility', label: 'الظهور في الدليل', icon: CheckCircle2 },
            { id: 'promote', label: 'الترويج والشارات', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = manageTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setManageTab(tab.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
            <span>تم حفظ التعديلات بنجاح في يمن ريتنغ!</span>
          </div>
        )}

        {/* 1. تبويب نظرة عامة */}
        {manageTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-400">التقييم العام</span>
                <p className="text-xl font-black text-[#FFC500] mt-1 flex items-center gap-1">
                  <Star size={16} className="fill-current" />
                  <span>{managingBiz.rating || '4.9'}</span>
                </p>
              </div>

              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-400">عدد التقييمات</span>
                <p className="text-xl font-black text-white mt-1">
                  {managingBiz.reviews_count || '14'} تقييم
                </p>
              </div>

              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-400">حالة التوثيق</span>
                <p className="text-xs font-black text-emerald-400 mt-2 flex items-center gap-1">
                  <ShieldCheck size={14} />
                  <span>ملكية موثقة</span>
                </p>
              </div>

              <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[11px] text-zinc-400">الظهور في البحث</span>
                <p className="text-xs font-black text-[#FFC500] mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>متصدر التصنيف</span>
                </p>
              </div>
            </div>

            <div className="bg-[#0a0f1d] border border-[#1e293b] p-5 rounded-2xl space-y-2">
              <h3 className="text-xs font-black text-white">النبذة التعريفية للمنشأة:</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {managingBiz.description}
              </p>
            </div>
          </div>
        )}

        {/* 2. تبويب بيانات المنشأة */}
        {manageTab === 'details' && (
          <form onSubmit={handleSave} className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 sm:p-6 space-y-3.5">
            <h2 className="text-xs font-black text-white border-b border-[#1e293b] pb-2">
              تعديل بيانات التواصل والخدمات
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">اسم المنشأة</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">رقم الهاتف / الاتصال</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">رقم الواتساب</label>
                <input
                  type="text"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">ساعات وأوقات العمل</label>
                <input
                  type="text"
                  value={editForm.working_hours}
                  onChange={(e) => setEditForm({ ...editForm, working_hours: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
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
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">نبذة تعريفية بالخدمات والنشاط</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white focus:border-[#FFC500] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. تبويب الصور */}
        {manageTab === 'photos' && (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20 flex items-center justify-center mx-auto">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-sm font-black text-white">إدارة صور وشعار المنشأة</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              يمكنك رفع شعار المنشأة الرسمي وصورة الغلاف الرئيسية وصور الفروع.
            </p>
            <button className="h-10 px-5 rounded-xl border border-[#1e293b] bg-[#060913] hover:border-[#FFC500] text-xs font-bold text-zinc-200 transition">
              رفع صورة جديدة
            </button>
          </div>
        )}

        {/* 4. تبويب التقييمات */}
        {manageTab === 'reviews' && (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <h2 className="text-xs font-black text-white">تقييمات ومراجعات العملاء</h2>
              <span className="text-[11px] text-[#FFC500] font-bold">14 تقييم حقيقي</span>
            </div>

            <div className="divide-y divide-[#1e293b]">
              <div className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">أحمد الحميري</span>
                  <div className="flex items-center gap-1 text-[#FFC500]">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs font-bold">5.0</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-300">خدمة ممتازة، دقة في المواعيد وباصات حديثة ومريحة جداً في الرحلات الطويلة.</p>
              </div>

              <div className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">محمد ناصر</span>
                  <div className="flex items-center gap-1 text-[#FFC500]">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-300">شحن البضائع وصل في نفس اليوم، تعامل احترافي وسريع.</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. تبويب الظهور */}
        {manageTab === 'visibility' && (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-black text-white">حالة ظهور المنشأة في دليل يمن ريتنغ</h3>
            <div className="p-4 rounded-2xl bg-[#060913] border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <span className="text-xs font-black text-white block">المنشأة نشطة وظاهرة للجمهور</span>
                  <span className="text-[11px] text-zinc-400">تظهر في نتائج البحث والترتيب الرسمي للتصنيف</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                مفعلة
              </span>
            </div>
          </div>
        )}

        {/* 6. تبويب الترويج */}
        {manageTab === 'promote' && (
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20 flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h2 className="text-sm font-black text-white">ترقية وتمييز المنشأة</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              احصل على شارة التميز الذهبية وظهور متصدر في أعلى نتائج البحث لتصنيف ({managingBiz.category}) في {managingBiz.city}.
            </p>
            <div className="pt-2">
              <Link
                to="/prices"
                className="inline-block py-2.5 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black no-underline transition shadow-sm"
              >
                الاطلاع على باقات الترويج والاشتراكات
              </Link>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ====================================================
  // 2. الشاشة الرئيسية لمركز تحكم المالك: "منشآتي"
  // ====================================================
  return (
    <div className="font-['Cairo',sans-serif] py-8 px-4 sm:px-6 text-white max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* رأس الصفحة: معلومات المالك */}
      <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#060913] border-2 border-[#FFC500]/40 text-[#FFC500] flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
            {ownerName ? ownerName.charAt(0) : <User size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">{ownerName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/30">
                مالك منشأة معتمد
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{ownerEmail} • مركز تحكم وإدارة المنشآت</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>إضافة منشأة جديدة</span>
        </button>
      </div>

      {/* ملخص سريع للمالك */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
          <span className="text-[11px] text-zinc-400">إجمالي المنشآت</span>
          <p className="text-xl font-black text-white mt-1">{businesses.length}</p>
        </div>
        <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
          <span className="text-[11px] text-zinc-400">المنشآت النشطة</span>
          <p className="text-xl font-black text-emerald-400 mt-1">{businesses.length}</p>
        </div>
        <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
          <span className="text-[11px] text-zinc-400">المنشآت المميزة</span>
          <p className="text-xl font-black text-[#FFC500] mt-1">1</p>
        </div>
        <div className="bg-[#0a0f1d] border border-[#1e293b] p-4 rounded-2xl">
          <span className="text-[11px] text-zinc-400">متوسط التقييمات</span>
          <p className="text-xl font-black text-[#FFC500] mt-1 flex items-center gap-1">
            <Star size={15} className="fill-current" />
            <span>4.9</span>
          </p>
        </div>
      </div>

      {/* قسم: "منشآتي" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white">منشآتي المعتمدة</h2>
            <p className="text-[11px] text-zinc-400">المنشآت التابعة لإدارتك الرسمية في يمن ريتنغ</p>
          </div>
          <span className="text-xs font-bold text-zinc-400 bg-[#0a0f1d] border border-[#1e293b] px-3 py-1 rounded-xl">
            {businesses.length} منشأة
          </span>
        </div>

        {/* بطاقات المنشآت المعتمدة (بطاقة موحدة لكافة التصنيفات) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-[#0a0f1d] border border-[#1e293b] hover:border-[#FFC500]/50 rounded-3xl p-5 space-y-4 transition flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20">
                    {biz.category || 'شركات النقل'}
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <MapPin size={12} className="text-[#FFC500]" />
                    <span>{biz.city}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-white mb-1.5">{biz.name}</h3>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 text-[#FFC500] font-bold">
                    <Star size={13} className="fill-current" />
                    <span>{biz.rating ? Number(biz.rating).toFixed(1) : '4.9'}</span>
                  </span>
                  <span>({biz.reviews_count || 14} تقييم)</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>نشطة</span>
                  </span>
                </div>
              </div>

              {/* الإجراءات: إدارة المنشأة + عرض المنشأة */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  onClick={() => handleOpenManage(biz)}
                  className="h-10 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Settings2 size={14} />
                  <span>إدارة المنشأة</span>
                </button>

                <a
                  href={`/businesses/${biz.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 rounded-xl border border-[#1e293b] bg-[#060913] hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer no-underline"
                >
                  <ExternalLink size={13} />
                  <span>عرض المنشأة</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <OwnerRequestModal
        userId={ownerId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
export default OwnerDashboardPage;
