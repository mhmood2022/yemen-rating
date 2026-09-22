'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, Save, Building2, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { OwnerRequest } from '../../types/auth';
import { YEMEN_RATING_CATEGORIES } from '../../constants/categories';

const YEMEN_CITIES_LIST = [
  'صنعاء',
  'عدن',
  'تعز',
  'حضرموت — المكلا',
  'حضرموت — سيئون',
  'الحديدة',
  'إب',
  'مأرب',
  'ذمار',
  'شبوة — عتق',
  'لحج',
  'أبين',
  'المهرة',
  'حجة',
  'صعدة',
  'البيضاء',
  'عمران',
  'الضالع',
  'سقطرى',
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
  const [requestType, setRequestType] = useState<'new_business' | 'claim_business'>(
    existingRequest?.request_type || 'new_business'
  );
  const [businessName, setBusinessName] = useState(existingRequest?.business_name || '');
  const [category, setCategory] = useState(existingRequest?.business_category || YEMEN_RATING_CATEGORIES[0]);
  const [city, setCity] = useState(existingRequest?.city || 'صنعاء');
  const [phone, setPhone] = useState(existingRequest?.contact_phone || '');
  const [notes, setNotes] = useState(existingRequest?.notes || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // إغلاق عند النقر في الخلفية المظلمة
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (targetStatus: 'draft' | 'submitted') => {
    if (!businessName.trim()) {
      setErrorMsg('يرجى إدخال اسم المنشأة.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم هاتف المالك للتحقق.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        user_id: userId,
        request_type: requestType,
        business_name: businessName.trim(),
        business_category: category,
        city: city.trim(),
        contact_phone: phone.trim(),
        notes: notes.trim() || null,
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };

      if (existingRequest?.id) {
        const { error } = await supabase
          .from('owner_requests')
          .update(payload)
          .eq('id', existingRequest.id)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('owner_requests')
          .insert(payload);

        if (error) throw error;
      }

      setSuccessMsg(
        targetStatus === 'submitted'
          ? 'تم إرسال طلبك بنجاح! وهو الآن قيد مراجعة إدارة يمن ريتنغ.'
          : 'تم حفظ الطلب كمسودة بنجاح.'
      );

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('تعذر حفظ الطلب حالياً، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-['Cairo',sans-serif] animate-fade-in"
      dir="rtl"
    >
      {/* بطاقة النافذة بهوية يمن ريتنغ الداكنة */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto"
      >
        {/* رأس النافذة */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-[#FFC500] flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                {existingRequest?.status === 'needs_update' ? 'تعديل واستكمال الطلب' : 'طلب الترقية إلى حساب مالك'}
              </h2>
              <span className="text-[11px] text-zinc-400">يمن ريتنغ • مراجعة الإدارة مطلوبة</span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* رسائل التنبيه */}
        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-3.5">
          
          {/* تبديل نوع الطلب بشكل مدمج وأنيق */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">نوع الطلب</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setRequestType('new_business')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  requestType === 'new_business'
                    ? 'bg-[#FFC500] text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                إضافة منشأة جديدة
              </button>

              <button
                type="button"
                onClick={() => setRequestType('claim_business')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  requestType === 'claim_business'
                    ? 'bg-[#FFC500] text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                المطالبة بملكية منشأة
              </button>
            </div>
          </div>

          {/* اسم المنشأة */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">اسم المنشأة <span className="text-[#FFC500]">*</span></label>
            <input
              type="text"
              required
              placeholder="مثال: فندق العنوان أو بنك التضامن"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none"
            />
          </div>

          {/* تصنيف المنشأة */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">تصنيف المنشأة في يمن ريتنغ <span className="text-[#FFC500]">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none cursor-pointer"
            >
              {YEMEN_RATING_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat} className="bg-zinc-950 text-white py-1">{cat}</option>
              ))}
            </select>
          </div>

          {/* المدينة ورقم الهاتف جنب بعض وبوضوح تام */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">المدينة / المحافظة <span className="text-[#FFC500]">*</span></label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none cursor-pointer"
              >
                {YEMEN_CITIES_LIST.map((c, idx) => (
                  <option key={idx} value={c} className="bg-zinc-950 text-white py-1">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">رقم هاتف للتواصل <span className="text-[#FFC500]">*</span></label>
              <input
                type="text"
                required
                placeholder="777000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* ملاحظات أو إثبات الصفة */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">ملاحظات أو إثبات الصفة (اختياري)</label>
            <textarea
              rows={2}
              placeholder="رقم السجل التجاري، الترخيص، أو صفة مالك المنشأة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:ring-1 focus:ring-[#FFC500] focus:outline-none resize-none"
            />
          </div>

          {/* أزرار الإجراءات في الأسفل */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('draft')}
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-bold transition cursor-pointer"
            >
              <Save size={14} />
              <span>مسودة</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('submitted')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-zinc-950 text-xs font-black transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>إرسال للمراجعة</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
