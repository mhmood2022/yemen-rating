'use client';

import React, { useState } from 'react';
import { X, Send, Building2 } from 'lucide-react';
import { submitOwnerRequest } from '@/services/ownerService';

interface Props {
  ownerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddBusinessModal: React.FC<Props> = ({ ownerId, isOpen, onClose, onSuccess }) => {
  const [data, setData] = useState({
    name: '',
    category: 'شركة',
    city: 'صنعاء',
    address: '',
    phone: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.phone) {
      alert('يرجى كتابة اسم المنشأة ورقم الهاتف');
      return;
    }
    setLoading(true);
    const ok = await submitOwnerRequest(ownerId, 'new_business', data);
    setLoading(false);
    if (ok) {
      alert('تم تقديم طلب إضافة المنشأة بنجاح، وهو الآن قيد مراجعة الإدارة العامة.');
      onSuccess();
      onClose();
    } else {
      alert('حدث خطأ أثناء تقديم الطلب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo']" dir="rtl">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-zinc-900" />
            <h2 className="text-sm sm:text-base font-black text-zinc-900">طلب إضافة منشأة جديدة</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">اسم المنشأة *</label>
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">التصنيف</label>
              <select
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900 bg-white"
              >
                <option value="شركة">شركة</option>
                <option value="فندق">فندق</option>
                <option value="مطعم">مطعم</option>
                <option value="كافيه">كافيه</option>
                <option value="مستشفى">مستشفى / عيادة</option>
                <option value="معرض سيارات">معرض سيارات</option>
                <option value="بنك">بنك / صرافة</option>
                <option value="متجر">متجر</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">المدينة</label>
              <input
                type="text"
                required
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">رقم الهاتف / الاتصال *</label>
            <input
              type="text"
              required
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">نبذة عن المنشأة</label>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
