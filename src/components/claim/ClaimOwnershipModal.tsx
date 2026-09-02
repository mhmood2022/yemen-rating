import React, { useState, useRef } from 'react';
import { ShieldCheck, Upload, Trash2, X, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { adminAuditService } from '../../services/adminService';

interface ClaimOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  entityType: string;
}

export const ClaimOwnershipModal: React.FC<ClaimOwnershipModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityName,
  entityType
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantRole, setApplicantRole] = useState('المدير العام / المفوض');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map(f => f.name);
      setDocuments(prev => [...prev, ...urls]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim() || !consentChecked) return;

    // توثيق الطلب وإرساله للإدارة
    adminAuditService.logAction(
      `تقديم طلب إثبات ملكية (${entityName})`,
      'claim_request',
      entityId,
      { applicantName, applicantPhone, applicantRole, entityType }
    );

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-['Cairo',sans-serif] text-white select-none">
      <div 
        className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#222226] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#FFC500]" />
            <h3 className="text-sm font-bold text-white">المطالبة بملكية وإدارة الصفحة</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">تم إرسال طلب الملكية بنجاح</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              طلبك الآن بحالة <b className="text-[#FFC500]">قيد مراجعة الإدارة (Pending)</b>. سيتم التحقق من الوثائق ومنحك صلاحية إدارة الصفحة بعد الاعتماد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[10px] text-zinc-400 block font-['Cairo']">المنشأة المستهدفة:</span>
              <b className="text-xs text-[#FFC500] font-bold">{entityName}</b>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">اسم مقدم الطلب*</label>
                <input
                  type="text"
                  required
                  placeholder="اسمك الكامل..."
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">الصفة / المنصب*</label>
                <input
                  type="text"
                  required
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-white outline-none focus:border-[#FFC500]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">رقم الهاتف الرسمي للتواصل والتحقق*</label>
              <input
                type="tel"
                required
                placeholder="777000111"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-white font-mono outline-none focus:border-[#FFC500]"
              />
            </div>

            {/* رفع وثائق إثبات الملكية */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">وثائق إثبات الملكية / السجل التجاري / التفويض</label>
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-[#18181C] border border-dashed border-[#FFC500]/50 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#FFC500]"
              >
                <Upload size={14} className="text-[#FFC500]" />
                <span>رفع الوثائق الرسمية (PDF أو صور)</span>
              </button>

              {documents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {documents.map((doc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1 font-mono">
                      <FileText size={10} className="text-[#FFC500]" /> {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">ملاحظات إضافية</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي تفاصيل تثبت صفتك الرسمية بالمنشأة..."
                className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-white outline-none focus:border-[#FFC500]"
              />
            </div>

            {/* الإقرار القانوني */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1 text-right">
              <p className="text-[10.5px] text-emerald-100 leading-relaxed">
                أقر بصفتي القانونية والمخولة بإدارة هذه المنشأة، وأتحمل المسؤولية الكاملة عن صحة الوثائق المرفوعة.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span className="text-[11px] font-bold text-white">أوافق وأؤكد صحة طلب الملكية</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#18181C] text-zinc-300">إلغاء</button>
              <button
                type="submit"
                disabled={!consentChecked}
                className="px-5 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 disabled:opacity-40 shadow-md cursor-pointer"
              >
                إرسال الطلب للاعتماد
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
