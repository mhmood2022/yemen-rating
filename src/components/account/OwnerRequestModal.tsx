'use client';

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, Send, Save, Building2, MapPin, ChevronDown, Check, 
  AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, 
  Phone, Globe, Clock, Sparkles, Navigation 
} from 'lucide-react';
import { OwnerRequest } from '../../types/auth';
import { YEMEN_RATING_CATEGORIES } from '../../constants/categories';

const YEMEN_CITIES_LIST = [
  'صنعاء', 'عدن', 'تعز', 'حضرموت — المكلا', 'حضرموت — سيئون', 
  'الحديدة', 'إب', 'مأرب', 'ذمار', 'شبوة', 'لحج', 'أبين', 
  'المهرة', 'حجة', 'صعدة', 'البيضاء', 'عمران', 'الضالع', 'سقطرى'
];

interface Props {
  userId: string;
  isOpen: boolean;
  existingRequest?: OwnerRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerRequestModal: React.FC<Props> = ({
  userId,
  isOpen,
  existingRequest,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState<'basic' | 'media' | 'contact' | 'offers'>('basic');
  
  // البيانات الأساسية
  const [requestType, setRequestType] = useState<'new_business' | 'claim_business'>('new_business');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(YEMEN_RATING_CATEGORIES[0]);
  const [city, setCity] = useState('صنعاء');
  const [address, setAddress] = useState('');

  // الهوية البصرية
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // قنوات الاتصال والخرائط
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  // ساعات العمل والعروض والوصف
  const [workingHours, setWorkingHours] = useState('');
  const [offers, setOffers] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // قوائم منسدلة مخصصة
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setIsCityOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setIsCategoryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (targetStatus: 'draft' | 'submitted') => {
    if (!businessName.trim()) {
      setActiveStep('basic');
      setErrorMsg('يرجى كتابة اسم المنشأة.');
      return;
    }
    if (!phone.trim()) {
      setActiveStep('contact');
      setErrorMsg('يرجى كتابة رقم هاتف التواصل مع المنشأة.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        user_id: userId,
        request_type: requestType,
        business_name: businessName.trim(),
        business_category: category,
        city: city.trim(),
        contact_phone: phone.trim(),
        notes: notes.trim() || null,
        status: targetStatus,
        logo_url: logoUrl.trim() || null,
        cover_url: coverUrl.trim() || null,
        map_url: mapUrl.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        working_hours: workingHours.trim() || null,
        offers: offers.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('owner_requests').insert(payload);
      if (error) throw error;

      setSuccessMsg(
        targetStatus === 'submitted'
          ? 'تم إرسال طلب المنشأة بكافة التفاصيل إلى الإدارة بنجاح!'
          : 'تم حفظ مسودة المنشأة بنجاح.'
      );

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto"
      >
        {/* رأس النموذج */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC500]/10 border border-[#FFC500]/30 text-[#FFC500] flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">إضافة وتوثيق منشأة جديدة</h2>
              <span className="text-[10px] text-zinc-400">نموذج الملف المتكامل للمنشآت في يمن ريتنغ</span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850">
            <X size={18} />
          </button>
        </div>

        {/* أشرطة التبويب للتنقل بين أقسام المنشأة */}
        <div className="flex gap-1 bg-[#060913] border border-[#1e293b] rounded-2xl p-1 mb-4 overflow-x-auto">
          {[
            { id: 'basic', label: '1. البيانات الأساسية', icon: Building2 },
            { id: 'media', label: '2. الشعار والغلاف', icon: ImageIcon },
            { id: 'contact', label: '3. الاتصال والخرائط', icon: Phone },
            { id: 'offers', label: '4. العروض والدوام', icon: Sparkles },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveStep(st.id as any)}
              className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                activeStep === st.id ? 'bg-[#FFC500] text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* رسائل التنبيه */}
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-bold">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. القسم الأساسي */}
        {activeStep === 'basic' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">نوع المعاملة</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#060913] border border-[#1e293b] rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRequestType('new_business')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    requestType === 'new_business' ? 'bg-[#FFC500] text-black font-black' : 'text-zinc-400'
                  }`}
                >
                  إضافة منشأة جديدة
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('claim_business')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    requestType === 'claim_business' ? 'bg-[#FFC500] text-black font-black' : 'text-zinc-400'
                  }`}
                >
                  المطالبة بملكية منشأة
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم المنشأة التجاري <span className="text-[#FFC500]">*</span></label>
              <input
                type="text"
                required
                placeholder="مثال: شركة الجوال للنقل الدولي"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
              />
            </div>

            {/* تصنيف المنشأة */}
            <div ref={categoryRef} className="relative">
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">تصنيف النشاط في يمن ريتنغ <span className="text-[#FFC500]">*</span></label>
              <button
                type="button"
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsCityOpen(false); }}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white flex items-center justify-between"
              >
                <span className="text-[#FFC500]">{category}</span>
                <ChevronDown size={14} />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {YEMEN_RATING_CATEGORIES.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => { setCategory(c); setIsCategoryOpen(false); }}
                      className="px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#151f32] hover:text-[#FFC500] cursor-pointer"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* المدينة والعنوان */}
            <div className="grid grid-cols-2 gap-2">
              <div ref={cityRef} className="relative">
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">المدينة / المحافظة</label>
                <button
                  type="button"
                  onClick={() => { setIsCityOpen(!isCityOpen); setIsCategoryOpen(false); }}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white flex items-center justify-between"
                >
                  <span className="truncate">{city}</span>
                  <ChevronDown size={14} />
                </button>
                {isCityOpen && (
                  <div className="absolute top-full right-0 left-0 mt-1 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {YEMEN_CITIES_LIST.map((ci, i) => (
                      <div
                        key={i}
                        onClick={() => { setCity(ci); setIsCityOpen(false); }}
                        className="px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#151f32] hover:text-[#FFC500] cursor-pointer"
                      >
                        {ci}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="الشارع، الحي، بجانب..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep('media')}
                className="h-9 px-4 rounded-xl bg-[#FFC500] text-black text-xs font-black"
              >
                التالي: الشعار والغلاف →
              </button>
            </div>
          </div>
        )}

        {/* 2. الهوية البصرية (الشعار والغلاف) */}
        {activeStep === 'media' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">رابط شعار المنشأة الرسمي (Logo URL)</label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                dir="ltr"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">ضع رابط صورة الشعار لتظهر كأيقونة رسمية للمنشأة.</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">رابط صورة الغلاف الرئيسية (Cover Banner URL)</label>
              <input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                dir="ltr"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">صورة واجهة المبنى أو التصميم الإعلاني العريض في رأس الصفحة.</span>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep('basic')}
                className="h-9 px-3 rounded-xl border border-[#1e293b] text-zinc-400 text-xs font-bold"
              >
                ← السابق
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('contact')}
                className="h-9 px-4 rounded-xl bg-[#FFC500] text-black text-xs font-black"
              >
                التالي: قنوات الاتصال والخرائط →
              </button>
            </div>
          </div>
        )}

        {/* 3. قنوات الاتصال والخرائط */}
        {activeStep === 'contact' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">رقم الهاتف الرسمي <span className="text-[#FFC500]">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="777000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">رقم الواتساب المباشر</label>
                <input
                  type="text"
                  placeholder="967777000000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">رابط الموقع على خرائط جوجل (Google Maps URL)</label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="info@business.ye"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">الموقع الإلكتروني / صفحة</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep('media')}
                className="h-9 px-3 rounded-xl border border-[#1e293b] text-zinc-400 text-xs font-bold"
              >
                ← السابق
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('offers')}
                className="h-9 px-4 rounded-xl bg-[#FFC500] text-black text-xs font-black"
              >
                التالي: العروض والخدمات →
              </button>
            </div>
          </div>
        )}

        {/* 4. العروض والدوام والوصف */}
        {activeStep === 'offers' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">ساعات وأوقات العمل</label>
              <input
                type="text"
                placeholder="مثال: من 8:00 صباحاً إلى 10:00 مساءً (الجمعة بعد الصلاة)"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white focus:border-[#FFC500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">العروض والخصومات والخدمات الخاصة</label>
              <textarea
                rows={2}
                placeholder="اكتب هنا أي عروض خاصة، تخفيضات موسمية، أو مميزات حصرية لمنشأتك..."
                value={offers}
                onChange={(e) => setOffers(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white focus:border-[#FFC500] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">نبذة تعريفية شاملة عن النشاط</label>
              <textarea
                rows={2}
                placeholder="شرح وافٍ عن تاريخ المنشأة، جودة الخدمات، وأسباب اختيار العملاء لها..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white focus:border-[#FFC500] focus:outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('draft')}
                className="h-10 px-3.5 rounded-xl border border-[#1e293b] bg-[#060913] text-zinc-300 text-xs font-bold"
              >
                <Save size={14} className="inline ml-1" />
                حفظ كمسودة
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('submitted')}
                className="h-10 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black font-black text-xs flex items-center gap-1.5"
              >
                {loading ? <Loader2 size={15} className="animate-spin text-black" /> : <Send size={15} />}
                <span>إرسال الملف المتكامل للإدارة</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
