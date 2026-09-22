'use client';

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, Save, Building2, MapPin, ChevronDown, Check, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { OwnerRequest } from '../../types/auth';
import { YEMEN_RATING_CATEGORIES } from '../../constants/categories';

const YEMEN_CITIES_LIST = [
  'صنعاء',
  'عدن',
  'تعز',
  'حضرموت',
  'الحديدة',
  'إب',
  'مأرب',
  'ذمار',
  'شبوة',
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

  // حالات فتح القوائم المنسدلة المخصصة (بدل سيلكت أندرويد)
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (targetStatus: 'draft' | 'submitted') => {
    if (!businessName.trim()) {
      setErrorMsg('يرجى إدخال اسم المنشأة.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم هاتف التواصل.');
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
          ? 'تم إرسال طلبك بنجاح وهو قيد المراجعة.'
          : 'تم حفظ المسودة بنجاح.'
      );

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('تعذر حفظ الطلب، يرجى المحاولة لاحقاً.');
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
      {/* النافذة بهوية موقع يمن ريتنغ الكحلية والذهبية */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 shadow-2xl text-white max-h-[92vh] overflow-y-auto"
      >
        {/* رأس النافذة */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC500]/10 border border-[#FFC500]/30 text-[#FFC500] flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                {existingRequest?.status === 'needs_update' ? 'تعديل طلب المالك' : 'طلب الترقية إلى حساب مالك'}
              </h2>
              <span className="text-[10px] text-zinc-400">يمن ريتنغ • مراجعة الإدارة مطلوبة</span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* التنبيهات */}
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

        <div className="space-y-3">
          
          {/* أزرار نوع الطلب المدمجة بنعومة */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">نوع الطلب</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#060913] border border-[#1e293b] rounded-2xl">
              <button
                type="button"
                onClick={() => setRequestType('new_business')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  requestType === 'new_business'
                    ? 'bg-[#FFC500] text-black shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                إضافة منشأة جديدة
              </button>

              <button
                type="button"
                onClick={() => setRequestType('claim_business')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  requestType === 'claim_business'
                    ? 'bg-[#FFC500] text-black shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                المطالبة بملكية منشأة
              </button>
            </div>
          </div>

          {/* اسم المنشأة */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">
              اسم المنشأة <span className="text-[#FFC500]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: فندق العنوان أو بنك التضامن"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white placeholder-zinc-500 focus:border-[#FFC500] focus:outline-none"
            />
          </div>

          {/* قائمة التصنيفات المخصصة بالكامل (نفس استايل صورتك) */}
          <div ref={categoryRef} className="relative">
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">
              تصنيف المنشأة في يمن ريتنغ <span className="text-[#FFC500]">*</span>
            </label>
            
            <button
              type="button"
              onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsCityOpen(false); }}
              className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] hover:border-[#FFC500]/50 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-[#FFC500]" />
                <span>{category}</span>
              </div>
              <ChevronDown size={15} className={`text-zinc-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* القائمة المنسدلة للتصنيفات */}
            {isCategoryOpen && (
              <div className="absolute top-full right-0 left-0 mt-1.5 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in">
                {YEMEN_RATING_CATEGORIES.map((cat, idx) => {
                  const isSelected = category === cat;
                  return (
                    <div
                      key={idx}
                      onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                        isSelected 
                          ? 'bg-[#FFC500] text-black font-black' 
                          : 'text-zinc-200 hover:bg-[#141d30] hover:text-[#FFC500]'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected ? <Check size={14} className="stroke-[3]" /> : <Building2 size={13} className="text-zinc-500" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* المدينة ورقم الهاتف */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* قائمة المحافظات المخصصة المطابقة لصورتك 100% */}
            <div ref={cityRef} className="relative">
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                المدينة / المحافظة <span className="text-[#FFC500]">*</span>
              </label>

              <button
                type="button"
                onClick={() => { setIsCityOpen(!isCityOpen); setIsCategoryOpen(false); }}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] hover:border-[#FFC500]/50 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={14} className="text-[#FFC500] shrink-0" />
                  <span className="truncate">{city}</span>
                </div>
                <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* القائمة المنبثقة للمحافظات بنفس تصميم الصورة الأولى تماماً */}
              {isCityOpen && (
                <div className="absolute top-full right-0 left-0 mt-1.5 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in">
                  {YEMEN_CITIES_LIST.map((c, idx) => {
                    const isSelected = city === c;
                    return (
                      <div
                        key={idx}
                        onClick={() => { setCity(c); setIsCityOpen(false); }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                          isSelected 
                            ? 'bg-[#FFC500] text-black font-black' 
                            : 'text-zinc-200 hover:bg-[#141d30] hover:text-[#FFC500]'
                        }`}
                      >
                        <span>{c}</span>
                        {isSelected ? <Check size={14} className="stroke-[3]" /> : <MapPin size={13} className="text-zinc-500" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                رقم التواصل <span className="text-[#FFC500]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="777000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#060913] border border-[#1e293b] text-xs font-bold text-white placeholder-zinc-500 focus:border-[#FFC500] focus:outline-none text-left"
                dir="ltr"
              />
            </div>

          </div>

          {/* الملاحظات */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">ملاحظات أو إثبات الصفة (اختياري)</label>
            <textarea
              rows={2}
              placeholder="رقم السجل التجاري، الترخيص، أو صفة مالك المنشأة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:outline-none resize-none"
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="pt-2.5 border-t border-[#1e293b] flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('draft')}
              className="h-10 px-3.5 rounded-xl border border-[#1e293b] bg-[#060913] text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>مسودة</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-3 text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('submitted')}
                className="h-10 px-5 rounded-xl bg-[#FFC500] hover:bg-[#eab308] text-black font-black text-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-black" />
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span>إرسال للمراجعة</span>
                    <Send size={14} className="stroke-[2.5]" />
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
