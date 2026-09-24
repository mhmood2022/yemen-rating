import React, { useState } from 'react';
import { Shield, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notificationService';

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
  const [role, setRole] = useState('المالك الرسمي');
  const [phone, setPhone] = useState('');
  const [commercialId, setCommercialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.trim().replace(/\D/g, "");
    const yemeniRegex = /^(77|78|73|71)\d{7}$/;
    if (cleanPhone.length !== 9 || !yemeniRegex.test(cleanPhone)) {
      setStatusMessage({
        type: "error",
        text: "رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بـ (77 أو 78 أو 73 أو 71)"
      });
      return;
    }

    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "يرجى كتابة اسم المالك أو المفوض" });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+967${cleanPhone}`;
      const regNo = commercialId.trim() || '109842 / مأرب';

      // 1. الإرسال إلى قاعدة البيانات Supabase
      if (supabase) {
        try {
          await supabase.from('business_claims').insert([{
            business_id: businessId,
            claimant_name: name.trim(),
            notes: `${role} - سجل: ${regNo}`,
            claimant_phone: cleanPhone,
            status: 'PENDING'
          }]);
        } catch (e) {
          console.warn('Supabase fallback:', e);
        }
      }

      // 2. الربط المباشر مع قائمة طلبات الانتظار في لوحة الإدارة /admin/owners
      const newClaim = {
        id: `claim_${Date.now()}`,
        facilityName: businessName || 'فندق بلقيس',
        sector: 'الفنادق',
        applicantName: name.trim(),
        phone: fullPhone,
        commercialRegisterNo: regNo,
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        requestDate: 'اليوم ' + new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
      };

      const existingClaims = JSON.parse(localStorage.getItem('yr_ownership_claims') || '[]');
      localStorage.setItem('yr_ownership_claims', JSON.stringify([newClaim, ...existingClaims]));

      // 3. إرسال إشعار فوري لمركز إشعارات الإدارة العامة
      if (typeof window !== 'undefined') { window.dispatchEvent(new Event('new_admin_notification')); }
      await notificationService.createNotification({
        title: `طلب إثبات ملكية: ${businessName || 'فندق بلقيس'}`,
        message: `قام (${name.trim()}) بطلب توثيق ملكية المنشأة برقم هاتف (${fullPhone}).`,
        type: 'verification',
        sender_name: name.trim(),
        sender_phone: fullPhone,
        facility_name: businessName || 'فندق بلقيس',
        sector: 'الفنادق',
        admin_module: 'owners'
      });

      setStatusMessage({
        type: "success",
        text: "تم إرسال طلب إثبات الملكية بنجاح! سيتم مراجعته واعتماده من الإدارة."
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "حدث خطأ أثناء إرسال الطلب: " + (err?.message || "يرجى المحاولة لاحقاً")
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
        {/* الترويسة */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">طلب إثبات ملكية المنشأة</h3>
              <p className="text-[10px] text-zinc-400 font-bold text-[#FFD000]">{businessName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {/* رسائل التنبيه */}
        {statusMessage && (
          <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="text-zinc-300 font-bold block mb-1">
              اسم المالك أو المفوض الرسمي <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="الاسم الرباعي كما في الهوية"
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD000]"
              required
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">
              الصفة أو المسمى الوظيفي <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="مثال: المالك، المدير العام، المفوض القانوني"
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD000]"
              required
            />
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">
              رقم الهاتف أو الواتساب الرسمي <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="770000000"
                className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#FFD000] text-left"
                dir="ltr"
                required
              />
              <span className="absolute left-3 top-2 text-zinc-500 text-xs font-mono pointer-events-none">+967</span>
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-bold block mb-1">
              رقم السجل التجاري أو الترخيص (اختياري)
            </label>
            <input
              type="text"
              value={commercialId}
              onChange={e => setCommercialId(e.target.value)}
              placeholder="اكتب رقم السجل التجاري للتحقق السريع..."
              className="w-full bg-[#161D2B] border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD000]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#EF4444] hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-lg shadow-rose-950/20"
            >
              {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
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
export default ClaimOwnershipModal;
