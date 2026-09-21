import React, { useState } from 'react';
import { 
  ArrowRight, 
  Info, 
  Edit3, 
  Image as ImageIcon, 
  Star, 
  Eye, 
  Sparkles, 
  Save, 
  ExternalLink,
  Upload,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { BusinessItem, ReviewItem } from '@/types/owner';

interface OwnerBusinessManagementProps {
  business: BusinessItem;
  reviews?: ReviewItem[];
  onBack: () => void;
  onSaveBusiness: (updatedData: Partial<BusinessItem>) => Promise<boolean>;
  onNavigateSubscription?: () => void;
}

export const OwnerBusinessManagement: React.FC<OwnerBusinessManagementProps> = ({
  business,
  reviews = [],
  onBack,
  onSaveBusiness,
  onNavigateSubscription,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'images' | 'reviews' | 'visibility' | 'promotion'>('overview');
  const [formData, setFormData] = useState({
    name: business.name || '',
    city: business.city || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    description: business.description || '',
    status: business.status || 'active',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const ok = await onSaveBusiness(formData);
      if (ok) {
        setStatusMessage('تم حفظ التغييرات بنجاح');
      } else {
        setStatusMessage('تعذر الحفظ، يرجى المحاولة لاحقاً');
      }
    } catch {
      setStatusMessage('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Info },
    { id: 'details', label: 'بيانات المنشأة', icon: Edit3 },
    { id: 'images', label: 'الصور', icon: ImageIcon },
    { id: 'reviews', label: 'التقييمات', icon: Star },
    { id: 'visibility', label: 'الظهور', icon: Eye },
    { id: 'promotion', label: 'الترويج والاشتراك', icon: Sparkles },
  ] as const;

  return (
    <div className="font-['Cairo'] w-full pb-16">
      {/* شريط الرجوع وعنوان المنشأة */}
      <div className="bg-white border-b border-zinc-200 py-4 px-4 sm:px-6 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
            title="رجوع للقائمة"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-900 leading-tight">
              {business.name}
            </h1>
            <p className="text-xs text-zinc-500">
              إدارة منشأة • {business.category_name || business.classification} • {business.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {statusMessage}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs sm:text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>

      {/* التبويبات المتجاوبة */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap min-w-max py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isCurrent
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* محتويات التبويبات */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        {/* 1. نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-base font-bold text-zinc-900 mb-4">ملخص المنشأة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-xs text-zinc-500">حالة التوثيق والظهور</span>
                  <p className="text-base font-bold text-zinc-900 mt-1">
                    {business.status === 'active' ? 'نشطة وظاهرة للجمهور' : 'غير نشطة أو قيد المراجعة'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-xs text-zinc-500">التقييم العام</span>
                  <p className="text-base font-bold text-zinc-900 mt-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {business.rating ? business.rating.toFixed(1) : 'لا توجد تقييمات بعد'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-xs text-zinc-500">باقة الاشتراك</span>
                  <p className="text-base font-bold text-zinc-900 mt-1">
                    {business.subscription_plan || (business.is_featured ? 'باقة مميزة' : 'الباقة المجانية')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 mb-2">الوصف التعريفي الحالي</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {business.description || 'لم يتم إضافة وصف للمنشأة بعد. يمكنك إضافته من تبويب "بيانات المنشأة".'}
              </p>
            </div>
          </div>
        )}

        {/* 2. بيانات المنشأة */}
        {activeTab === 'details' && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900">تعديل بيانات المنشأة</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">اسم المنشأة</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">المدينة</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">العنوان بالتفصيل</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">رقم الهاتف / الواتساب</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">الموقع الإلكتروني / رابط</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">وصف المنشأة وخدماتها</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>
        )}

        {/* 3. الصور */}
        {activeTab === 'images' && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-zinc-900">صور المنشأة والشعار</h2>
              <p className="text-xs text-zinc-500">إدارة الصورة الرئيسية وألبوم الصور الخاص بمنشأتك</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-6 text-center hover:border-zinc-400 transition">
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-800">صورة الغلاف الرئيسية</p>
                <p className="text-[11px] text-zinc-500 mb-3">PNG, JPG حتى 5 ميجابايت</p>
                {business.cover_image && (
                  <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                    <img src={business.cover_image} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-6 text-center hover:border-zinc-400 transition">
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-800">شعار المنشأة (Logo)</p>
                <p className="text-[11px] text-zinc-500 mb-3">مربع بحد أدنى 200×200 بكسل</p>
                {business.logo_url && (
                  <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden mb-3 border border-zinc-200">
                    <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. التقييمات */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">تقييمات العملاء</h2>
                <p className="text-xs text-zinc-500">متابعة آراء ومراجعات الزوار الحقيقية</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700">
                {reviews.length} تقييم
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">
                <Star className="w-10 h-10 stroke-[1.2] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">لا توجد تقييمات مسجلة لهذه المنشأة حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700">
                          {rev.user_name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-zinc-800">{rev.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. الظهور */}
        {activeTab === 'visibility' && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900">حالة ظهور المنشأة</h2>
            <p className="text-xs text-zinc-500">تحكم في حالة إتاحة المنشأة للمستخدمين في محرك بحث ودليل يمن ريتنغ</p>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">حالة العرض</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              >
                <option value="active">نشطة (ظاهرة للجميع)</option>
                <option value="suspended">إيقاف مؤقت (مخفية من البحث)</option>
                <option value="draft">مسودة</option>
              </select>
            </div>
          </div>
        )}

        {/* 6. الترويح والاشتراك */}
        {activeTab === 'promotion' && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">ترويج المنشأة والباقات</h2>
                <p className="text-xs text-zinc-500">احصل على ظهور متصدر في نتائج البحث وشارة التوثيق الذهبية</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">الاشتراك الحالي:</span>
                <span className="font-bold text-zinc-900">{business.subscription_plan || 'الباقة المجانية'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">حالة التمييز:</span>
                <span className="font-bold text-zinc-900">{business.is_featured ? 'منشأة مميزة' : 'غير مميزة'}</span>
              </div>
            </div>

            <div className="pt-2">
              {onNavigateSubscription ? (
                <button
                  type="button"
                  onClick={onNavigateSubscription}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm hover:bg-amber-600 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  الانتقال لصفحة الاشتراكات والترويج الموحدة
                </button>
              ) : (
                <Link
                  href="/subscriptions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm hover:bg-amber-600 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  ترقية المنشأة الآن
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
