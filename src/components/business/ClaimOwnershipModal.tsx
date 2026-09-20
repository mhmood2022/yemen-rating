import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, X } from 'lucide-react';

interface Props {
  businessId: string;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimOwnershipModal: React.FC<Props> = ({
  businessId,
  businessName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [commercialId, setCommercialId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.trim().replace(/\D/g, "");
    const yemeniRegex = /^(77|78|73|71)\d{7}$/;
    if (cleanPhone.length !== 9 || !yemeniRegex.test(cleanPhone)) {
      alert("رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بـ (77 أو 78 أو 73 أو 71)");
      return;
    }

    setLoading(true);

    try {
      const fullRole = commercialId ? `${role} (سجل: ${commercialId})` : role;

      const { error } = await supabase.from('business_claims').insert([{
        business_id: businessId,
        claimant_name: name.trim(),
        notes: fullRole.trim(),
        claimant_phone: cleanPhone,
        status: 'PENDING'
      }]);

      if (error) {
        throw error;
      }

      alert('تم إرسال طلب إثبات الملكية بنجاح! سيتم مراجعته والتواصل معكم.');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('حدث خطأ أثناء إرسال الطلب: ' + (err?.message || 'يرجى المحاولة لاحقاً'));
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
        className="bg-[#0B0F17] border border-zinc-800 rounded-2xl w-full max-w-sm p-4 space-y-3 text-right shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="text-[#EF4444]" size={16} />
            <span>طلب إثبات ملكية الصفحة</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition"
          >
            <X size={14} />
          </button>
        </div>

        {businessName && (
          <p className="text-xs font-bold text-[#EAB308] bg-black/60 p-2 rounded-lg border border-zinc-800/80 truncate">
            المنشأة: {businessName}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="block text-zinc-300 mb-1 text-[11px] font-bold">
              اسم المفوض / ممثل المنشأة <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الرباعي كما في الهوية"
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right font-['Cairo']"
            />
          </div>

          <div>
            <label className="block text-zinc-300 mb-1 text-[11px] font-bold">
              الصفة أو المسمى الوظيفي <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="مثال: مدير الفرع / الممثل القانوني / مسؤول التسويق"
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right font-['Cairo']"
            />
          </div>

          <div>
            <label className="block text-zinc-300 mb-1 text-[11px] font-bold">
              رقم الهاتف أو الواتساب الرسمي <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="tel"
              required
              maxLength={9}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right font-mono"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 text-[11px]">
              رقم السجل التجاري أو صفة التفويض (اختياري)
            </label>
            <input
              type="text"
              value={commercialId}
              onChange={(e) => setCommercialId(e.target.value)}
              placeholder="اكتب رقم السجل التجاري أو أي بيانات إضافية للتحقق..."
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right font-['Cairo']"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs cursor-pointer font-['Cairo']"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-[#EF4444] hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition disabled:opacity-50 font-['Cairo']"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimOwnershipModal;
