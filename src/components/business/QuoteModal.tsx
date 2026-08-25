import React, { useState } from 'react';
import { BusinessItem } from '../../types/database.types';

interface Props {
  business: BusinessItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export const QuoteModal: React.FC<Props> = ({ business, isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen || !business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans" dir="rtl">
      <div className="bg-[#14141C] border border-[#2A2A38] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 text-white">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#22222E]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-file-invoice-dollar text-amber-400 text-lg"></i>
            <div>
              <h3 className="text-base font-black text-white">طلب عرض سعر واستفسار مباشر</h3>
              <p className="text-xs text-amber-400 mt-0.5">{business.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">اسمك الكريم *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="مثال: يحيى حمود" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">رقم الهاتف للاتصال والواتساب *</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="770123456" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">الخدمة المطلوبة *</label>
            <input type="text" required value={service} onChange={e => setService(e.target.value)} placeholder="مثال: حجز جناح / صيانة / تمويل..." className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">تفاصيل واستفسارات إضافية *</label>
            <textarea rows={3} required value={details} onChange={e => setDetails(e.target.value)} placeholder="اكتب تفاصيل طلبك ليقوم المالك بالرد عليك..." className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"></textarea>
          </div>
          <button type="submit" className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition">
            إرسال طلب السعر لإدارة المنشأة فوراً
          </button>
        </form>
      </div>
    </div>
  );
};
