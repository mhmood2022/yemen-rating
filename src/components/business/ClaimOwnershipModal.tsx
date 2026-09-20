import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react';

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
  const [applicantName, setApplicantName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [commercialId, setCommercialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('business_claims').insert([{
      business_id: businessId,
      claimant_name: applicantName,
      claimant_phone: phone,
      notes: `الصفة: ${position} ${commercialId ? ' | السجل/التفويض: ' + commercialId : ''}`,
      status: 'PENDING'
    }]);

    setLoading(false);
    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } else {
      alert('حدث خطأ أثناء إرسال الطلب: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm font-['Cairo']" dir="rtl">
      <div className="bg-[#0B0F17] border border-[#1F2937] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-5 text-white animate-in fade-in zoom-in duration-200">
        
        {/* الرأس */}
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#161D2B] border border-[#1F2937] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#F87171] flex items-center gap-1.5 justify-end">
                <span>طلب إثبات ملكية المنشأة</span>
                <ShieldCheck size={18} className="text-[#EF4444]" />
              </h3>
              {businessName && (
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[220px]">{businessName}</p>
              )}
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl border border-emerald-500/30">
              <CheckCircle2 size={26} />
            </div>
            <h4 className="text-sm font-bold text-white">تم إرسال طلب إثبات الملكية بنجاح!</h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              طلبك الآن قيد مراجعة فريق إدارة يمن ريتغ وسيتم التواصل معك والتحقق قريباً.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-right">
            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-1">
                اسم المفوض / ممثل المنشأة <span className="text-[#EAB308]">*</span>
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
                placeholder="الاسم الرباعي كما في الهوية"
                className="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-1">
                الصفة أو المسمى الوظيفي <span className="text-[#EAB308]">*</span>
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="مثال: مدير الفرع / الممثل القانوني / مسؤول التسويق"
                className="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-1">
                رقم الهاتف أو الواتساب الرسمي <span className="text-[#EAB308]">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="مثال: 771234567"
                className="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-1">
                رقم السجل التجاري أو صفة التفويض (اختياري)
              </label>
              <input
                type="text"
                value={commercialId}
                onChange={e => setCommercialId(e.target.value)}
                placeholder="اكتب رقم السجل التجاري أو أي بيانات إضافية للتحقق..."
                className="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#EAB308] hover:bg-amber-400 text-black text-xs font-black shadow transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#161D2B] border border-[#1F2937] text-zinc-300 text-xs font-bold hover:bg-[#1E273A] transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
