'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Info, 
  Star, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Save, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { BusinessItem, ReviewItem } from '@/types/owner';
import { updateSafeBusinessData, replyToReview, submitOwnerRequest } from '@/services/ownerService';

interface Props {
  business: BusinessItem;
  reviews: ReviewItem[];
  onBack: () => void;
  publicRoutePrefix?: string;
}

export const OwnerMiniManagement: React.FC<Props> = ({
  business,
  reviews,
  onBack,
  publicRoutePrefix = '/businesses',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'stats' | 'subscription' | 'promote' | 'edit'>('overview');
  const [formData, setFormData] = useState({
    description: business.description || '',
    phone: business.phone || '',
    whatsapp: business.whatsapp || '',
    website: business.website || '',
    address: business.address || '',
    working_hours: business.working_hours || '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // حفظ التعديلات العامة
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const ok = await updateSafeBusinessData(business.id, business.owner_id, formData);
    setSaving(false);
    if (ok) {
      setMessage('تم حفظ التعديلات بنجاح.');
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage('تعذر الحفظ، يرجى المحاولة لاحقاً.');
    }
  };

  // تقديم طلب ترويج
  const handlePromotionRequest = async () => {
    const ok = await submitOwnerRequest(business.owner_id, 'promotion_request', {
      business_name: business.name,
      plan_requested: 'featured_spotlight',
    }, business.id);

    if (ok) {
      alert('تم إرسال طلب الترويج إلى الإدارة العامة لمراجعته.');
    }
  };

  return (
    <div className="font-['Cairo'] min-h-screen bg-zinc-50 pb-16" dir="rtl">
      {/* الشريط العلوي */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
              title="رجوع إلى منشآتي"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
                إدارة: {business.name}
              </h1>
              <p className="text-xs text-zinc-500">
                {business.category} • {business.city}
              </p>
            </div>
          </div>

          <a
            href={`${publicRoutePrefix}/${business.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            الصفحة العامة
          </a>
        </div>

        {/* التبويبات */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-zinc-100">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Info },
            { id: 'reviews', label: 'التقييمات', icon: Star },
            { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
            { id: 'subscription', label: 'الاشتراك', icon: ShieldCheck },
            { id: 'promote', label: 'الترويج والإعلان', icon: Sparkles },
            { id: 'edit', label: 'تعديل المنشأة', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap inline-flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {message}
          </div>
        )}

        {/* 1. نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200">
                <span className="text-xs text-zinc-500">متوسط التقييم</span>
                <p className="text-xl font-black text-zinc-900 mt-1 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {business.rating ? Number(business.rating).toFixed(1) : 'غير متوفر'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200">
                <span className="text-xs text-zinc-500">عدد التقييمات</span>
                <p className="text-xl font-black text-zinc-900 mt-1">
                  {business.reviews_count || 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zinc-200">
                <span className="text-xs text-zinc-500">حالة المنشأة</span>
                <p className="text-sm font-bold text-zinc-900 mt-2">
                  {business.status === 'active' ? 'نشطة في الدليل' : 'قيد المراجعة / معلقة'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 mb-2">الوصف التعريفي الحالي</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {business.description || 'لم يتم إضافة وصف بعد.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. التقييمات */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">تقييمات الزوار الحقيقية</h2>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-lg">
                {reviews.length} تقييم
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs font-semibold">
                لا توجد أي تقييمات مسجلة لهذه المنشأة حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-zinc-800">{rev.user_name}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                    {rev.reply && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs">
                        <span className="font-bold text-zinc-800 block mb-0.5">ردك كمالك:</span>
                        <p className="text-zinc-600">{rev.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. الإحصائيات (الحقيقية فقط) */}
        {activeTab === 'stats' && (
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900">إحصائيات التفاعل المسجلة فعلياً</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[11px] text-zinc-500">مشاهدات الصفحة</span>
                <p className="text-lg font-bold text-zinc-900 mt-1">
                  {business.views_count !== undefined ? business.views_count : 'غير متوفر حالياً'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[11px] text-zinc-500">نقرات الاتصال</span>
                <p className="text-lg font-bold text-zinc-900 mt-1">
                  {business.phone_clicks !== undefined ? business.phone_clicks : 'غير متوفر حالياً'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[11px] text-zinc-500">نقرات الواتساب</span>
                <p className="text-lg font-bold text-zinc-900 mt-1">
                  {business.whatsapp_clicks !== undefined ? business.whatsapp_clicks : 'غير متوفر حالياً'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-[11px] text-zinc-500">نقرات الموقع</span>
                <p className="text-lg font-bold text-zinc-900 mt-1">
                  {business.website_clicks !== undefined ? business.website_clicks : 'غير متوفر حالياً'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. الاشتراك */}
        {activeTab === 'subscription' && (
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900">حالة اشتراك المنشأة</h2>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">الخطة الحالية:</span>
                <span className="font-bold text-zinc-900">{business.subscription_plan || 'الباقة المجانية'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">حالة التمييز:</span>
                <span className="font-bold text-zinc-900">{business.is_featured ? 'مميزة' : 'غير مميزة'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">تاريخ الانتهاء:</span>
                <span className="font-bold text-zinc-900">{business.subscription_end || 'غير محدد'}</span>
              </div>
            </div>

            <a
              href="/subscriptions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
            >
              عرض باقات الاشتراكات
            </a>
          </div>
        )}

        {/* 5. الترويج والإعلان */}
        {activeTab === 'promote' && (
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900">طلب ترويج المنشأة</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              يمكنك تقديم طلب لإبراز منشأتك في أعلى نتائج البحث لتصنيف ({business.category}) في مدينة ({business.city}). يخضع كل طلب لمراجعة وموافقة الإدارة العامة.
            </p>

            <button
              onClick={handlePromotionRequest}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition"
            >
              <Sparkles className="w-4 h-4" />
              إرسال طلب ترويج للإدارة
            </button>
          </div>
        )}

        {/* 6. تعديل المنشأة المسموح */}
        {activeTab === 'edit' && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900">تعديل بيانات المنشأة المسموح بها</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">رقم الواتساب</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">الموقع الإلكتروني</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ساعات العمل</label>
                <input
                  type="text"
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">العنوان</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">الوصف التعريفي</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
