import React, { useState, useRef } from 'react';
import { 
  Briefcase, MapPin, ArrowRight, Plus, CheckCircle2, 
  User, X, Upload, Trash2, ShieldCheck, 
  FileText, Check, AlertCircle, Sparkles, Building2, Cpu
} from 'lucide-react';
import { AdBanner } from '../../components/common/AdBanner';

export const JobDetailsPage: React.FC = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantPhone.replace(/[^0-9]/g, '').length || applicantPhone.length < 9) {
      setToastMessage('يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (!agreedToPolicy) return;

    setIsApplyModalOpen(false);
    setToastMessage('تم استلام طلب التقديم وسيرتك الذاتية بنجاح وسيتم التنسيق معك');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="7" className="mb-1" />

      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button onClick={() => window.history.back()} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للوظائف</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-100 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="border-b border-[#1F2937] pb-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#16A34A]/20 text-[#16A34A] text-[10px] font-black">دوام كامل</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">تكنولوجيا ومعلومات</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">الشاغر نشط ومعتمد</span>
          </div>

          <h1 className="text-base sm:text-xl font-black text-white leading-snug">مهندس برمجيات وتطبيقات React & Node.js</h1>

          <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono flex-wrap">
            <span className="flex items-center gap-1 text-[#FFC500]"><MapPin size={13} /> صنعاء — حدة</span>
            <span>•</span>
            <span>الراتب: <b className="text-white">650,000 ﷼</b></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
          <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">الخبرة المطلوبة</span><b className="text-xs text-white font-bold font-['Cairo']">3-5 سنوات</b></div>
          <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">المؤهل العلمي</span><b className="text-xs text-white font-bold font-['Cairo']">بكالوريوس</b></div>
          <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">الجنس</span><b className="text-xs text-white font-bold font-['Cairo']">لا يشترط</b></div>
          <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">وساطة التوظيف</span><b className="text-xs text-[#16A34A] font-bold font-['Cairo']">يمن ريتغ ✓</b></div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white">الوصف الوظيفي والمهام:</h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">مطلوب مهندس برمجيات ذو كفاءة عالية لتطوير وصيانة منصات الويب وقواعد البيانات والربط مع الـ API.</p>
          </div>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="w-full py-3.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <FileText size={15} />
          <span>التقديم على الوظيفة الآن</span>
        </button>
      </div>

      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer" onClick={() => setIsApplyModalOpen(false)}>
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto no-scrollbar cursor-default shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5"><FileText size={15} className="text-[#FFC500]" /> التقديم على الوظيفة</h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white">رجوع</button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">الاسم الكامل*</label>
                <input type="text" required placeholder="اسمك الثلاثي..." value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">رقم الهاتف (9 أرقام إجباري)*</label>
                <input type="tel" required placeholder="777000111" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]" />
              </div>

              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs"><ShieldCheck size={16} /><span>تنبيه إلزامي :</span></div>
                <p className="text-[11px] text-emerald-100 leading-relaxed">
                  توفر لك منصة يمن ريتغ خدمة الوساطة والتوظيف، ويتم إشعارك عند حصولك على الوظيفة. بتقديم الطلب، يقرّ المتقدم بموافقته على شروط الوساطة ويلتزم بسداد عمولة الوساطة البالغة (20,000 ريال يمني) من راتب الشهر الأول عند استلام الوظيفة.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={agreedToPolicy} onChange={(e) => setAgreedToPolicy(e.target.checked)} className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer" />
                  <span className="text-[11px] font-bold text-white">أوافق على شروط الوساطة والالتزام بسداد العمولة (20,000 ريال يمني)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsApplyModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold">إلغاء</button>
                <button type="submit" disabled={!agreedToPolicy} className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 disabled:opacity-40 shadow-md">إرسال طلب التقديم</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
