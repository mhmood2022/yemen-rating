'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, Save, Building2, AlertCircle } from 'lucide-react';
import { OwnerRequest } from '../../types/auth';
import { YEMEN_RATING_CATEGORIES } from '../../constants/categories';

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

  if (!isOpen) return null;

  const handleSubmit = async (targetStatus: 'draft' | 'submitted') => {
    if (!businessName.trim() || !phone.trim()) {
      setErrorMsg('يرجى كتابة اسم المنشأة ورقم هاتف التواصل.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

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

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الطلب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Cairo']" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-zinc-900">
                {existingRequest?.status === 'needs_update' ? 'تعديل واستكمال الطلب' : 'طلب الترقية إلى حساب مالك'}
              </h2>
              <p className="text-[11px] text-zinc-500">يمن ريتنغ • مراجعة الإدارة مطلوبة للتفعيل</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">نوع الطلب</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestType('new_business')}
                className={`p-3 rounded-2xl border text-xs font-bold text-right transition ${
                  requestType === 'new_business'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                إضافة منشأة جديدة
                <span className="block text-[10px] opacity-75 font-normal mt-0.5">منشأة غير موجودة بالدليل</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestType('claim_business')}
                className={`p-3 rounded-2xl border text-xs font-bold text-right transition ${
                  requestType === 'claim_business'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                المطالبة بمنشأة مسجلة
                <span className="block text-[10px] opacity-75 font-normal mt-0.5">منشأة موجودة مسبقاً بالموقع</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">اسم المنشأة *</label>
            <input
              type="text"
              placeholder="مثال: فندق العنوان أو بنك التضامن"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">تصنيف المنشأة في يمن ريتنغ *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white"
            >
              {YEMEN_RATING_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">المدينة / المحافظة *</label>
              <input
                type="text"
                placeholder="صنعاء، عدن..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">هاتف المالك للتواصل *</label>
              <input
                type="text"
                placeholder="777000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">ملاحظات أو إثبات الصفة (اختياري)</label>
            <textarea
              rows={2}
              placeholder="رقم السجل التجاري، الترخيص، أو أي تفاصيل تساعد الإدارة في التحقق"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-900 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('draft')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              حفظ كمسودة
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-zinc-500 text-xs font-bold hover:bg-zinc-100"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('submitted')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
