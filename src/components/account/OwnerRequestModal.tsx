'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, Building2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { OFFICIAL_CATEGORIES } from '../../data/categories';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userPhone?: string;
}

export const OwnerRequestModal: React.FC<Props> = ({
  userId,
  isOpen,
  onClose,
  onSuccess,
  userPhone = ''
}) => {
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(OFFICIAL_CATEGORIES[0]?.name || 'الفنادق');
  const [city, setCity] = useState('صنعاء');
  const [phone, setPhone] = useState(userPhone);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى كتابة اسم المنشأة' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      // 1. تسجيل الطلب في قاعدة البيانات بجدول owner_requests بحالة under_review (قيد المراجعة)
      if (supabase && userId) {
        try {
          await supabase.from('owner_requests').insert([{
            user_id: userId,
            request_type: 'new_business',
            business_name: businessName.trim(),
            business_category: category,
            city: city,
            contact_phone: phone.trim(),
            notes: notes.trim(),
            status: 'under_review',
            created_at: new Date().toISOString()
          }]);
        } catch (e) {
          console.warn('Supabase insert warning:', e);
        }
      }

      // 2. إرسال إشعار فوري لمركز إشعارات الإدارة العامة
      await notificationService.createNotification({
        title: `طلب إضافة منشأة جديدة: ${businessName.trim()}`,
        message: `طلب من المستخدم إضافة منشأة في قطاع (${category}) بمدينة (${city}).`,
        type: 'facility',
        sender_phone: phone,
        facility_name: businessName.trim(),
        sector: category,
        admin_module: 'facilities'
      });

      setStatusMsg({
        type: 'success',
        text: 'تم إرسال طلب إضافة المنشأة إلى الإدارة العامة للمراجعة والاعتماد!'
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: 'حدث خطأ أثناء إرسال الطلب: ' + (err?.message || 'يرجى المحاولة ثانية')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-['Cairo'] select-none"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-[#0B0F17] border border-zinc-800 rounded-2xl w-full max-w-sm p-4 space-y-3 text-right shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-[#FFD000]">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">طلب إضافة منشأة جديدة</h3>
              <p className="text-[10px] text-zinc-400">مراجعة واعتماد رسمي من الإدارة العامة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {statusMsg && (
          <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="text-zinc-300 font-bold block mb-1">
              اسم المنشأة أو النشاط التجاري <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="مثال: فندق قصر سبأ، مطاعم الشيباني..."
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD000]"
              required
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">القطاع الرسمي</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFD000]"
            >
              {OFFICIAL_CATEGORIES.map(c => (
                <option key={c.id} value={c.name} className="bg-[#0B0F17] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">المدينة أو المحافظة</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFD000]"
            >
              <option value="صنعاء" className="bg-[#0B0F17]">صنعاء</option>
              <option value="عدن" className="bg-[#0B0F17]">عدن</option>
              <option value="مأرب" className="bg-[#0B0F17]">مأرب</option>
              <option value="تعز" className="bg-[#0B0F17]">تعز</option>
              <option value="حضرموت" className="bg-[#0B0F17]">حضرموت</option>
              <option value="الحديدة" className="bg-[#0B0F17]">الحديدة</option>
              <option value="إب" className="bg-[#0B0F17]">إب</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">رقم الهاتف للتواصل</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="770000000"
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#FFD000] text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">ملاحظات إضافية للإدارة</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي تفاصيل أو وثائق إثبات..."
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl p-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD000] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#FFD000] hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>إرسال الطلب للإدارة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-[#161D2B] hover:bg-zinc-800 text-zinc-300 font-bold py-2 rounded-xl text-xs border border-zinc-800"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
