'use client';

import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { submitOwnerRequest } from '@/services/ownerService';

interface Props {
  ownerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimBusinessModal: React.FC<Props> = ({ ownerId, isOpen, onClose, onSuccess }) => {
  const [businessName, setBusinessName] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone) {
      alert('يرجى تحديد اسم المنشأة ورقم هاتفك');
      return;
    }
    setLoading(true);
    const ok = await submitOwnerRequest(ownerId, 'claim_business', {
      claimed_business_name: businessName,
      contact_phone: phone,
      proof_details: proofDetails,
    });
    setLoading(false);
    if (ok) {
      alert('تم إرسال طلب المطالبة إلى الإدارة العامة للتحقق.');
      onSuccess();
      onClose();
    } else {
      alert('حدث خطأ أثناء إرسال الطلب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo']" dir="rtl">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-900" />
            <h2 className="text-sm sm:text-base font-black text-zinc-900">المطالبة بملكية منشأة مسجلة</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">اسم المنشأة المسجلة في الموقع *</label>
            <input
              type="text"
              required
              placeholder="مثال: فندق موفنبيك صنعاء"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">رقم هاتف المالك للتحقق *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">إثبات الملكية / بيانات إضافية للتحقق</label>
            <textarea
              rows={3}
              placeholder="السجل التجاري أو الصفة الرسمية"
              value={proofDetails}
              onChange={(e) => setProofDetails(e.target.value)}
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
              {loading ? 'جارٍ الإرسال...' : 'إرسال طلب المطالبة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
