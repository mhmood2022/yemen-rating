import React, { useState } from 'react';
import { businessService } from '../../services/businessService';

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
  const [position, setPosition] = useState('المدير العام / المالك');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await businessService.submitOwnershipClaim({
      business_id: businessId,
      applicant_name: applicantName,
      position,
      phone,
      official_email: email,
    });

    setLoading(false);
    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } else {
      alert('حدث خطأ أثناء إرسال الطلب: ' + res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans" dir="rtl">
      <div className="bg-[#181820] border border-[#2A2A38] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 text-white">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#242432]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold text-base">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h3 className="text-base font-black text-white">طلب إثبات ملكية منشأة</h3>
              <p className="text-xs text-amber-400">{businessName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 text-lg">✕</button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">
              <i className="fa-solid fa-check"></i>
            </div>
            <h4 className="text-base font-bold text-white">تم إرسال طلب إثبات الملكية بنجاح!</h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              طلبك الآن قيد مراجعة فريق إدارة يمن ريتغ وسيتم إشعارك فور التحقق.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">الاسم الكامل لمقدم الطلب *</label>
              <input type="text" required value={applicantName} onChange={e => setApplicantName(e.target.value)} placeholder="مثال: أحمد محمد الأحمدي" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">الصفة / المنصب *</label>
                <input type="text" required value={position} onChange={e => setPosition(e.target.value)} className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">رقم الهاتف الرسمي *</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="770123456" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">البريد الإلكتروني الرسمي للنشاط</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="official@company.com" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-bold hover:bg-neutral-800">إلغاء</button>
              <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-black text-xs font-black shadow transition disabled:opacity-50">
                {loading ? 'جاري الإرسال...' : 'إرسال طلب التحقق'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
