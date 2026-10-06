import React, { useState, useEffect, useRef } from "react";
import {
  X, Briefcase, MapPin, DollarSign, Plus, Trash2, CheckCircle2, ChevronDown, Check, Loader2, Building2, Phone, Mail, Lock, ShieldCheck
} from "lucide-react";
import { JobFormData } from "../../pages/admin/jobs/AddJobModal";

const YEMEN_GOVS = [
  "صنعاء", "عدن", "تعز", "حضرموت", "الحديدة", "إب", "ذمار",
  "مأرب", "شبوة", "صعدة", "حجة", "لحج", "أبين", "البيضاء",
  "عمران", "الضالع", "المهرة", "سقطرى", "ريمة", "الجوف", "المحويت"
];

const SECTORS = [
  "المحاسبة والمالية",
  "تقنية وبرمجيات",
  "طب ورعاية صحية",
  "مبيعات وتسويق",
  "هندسة ومقاولات",
  "إدارة وموارد بشرية",
  "نقل وخدمات لوجستية",
  "خدمة عملاء واستقبال",
  "تعليم وتدريب",
  "أخرى"
];

const WORK_TYPES = ["دوام كامل", "دوام جزئي", "عن بعد (Remote)", "تدريب منتهي بالتوظيف", "عقد مؤقت"];
const EXP_LEVELS = ["بدون خبرة / حديث تخرج", "مبتدئ (0-1 سنة)", "متوسط (2-4 سنوات)", "خبير (5+ سنوات)", "إداري وقيادي"];
const CURRENCIES = ["ريال يمني", "دولار أمريكي", "ريال سعودي"];




const CustomSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
}> = ({ value, onChange, options, disabled }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full bg-[#111625] border ${
          open ? "border-[#FFC500] ring-1 ring-[#FFC500]/30" : "border-slate-700/80 hover:border-slate-600"
        } disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3.5 py-2.5 text-white flex items-center justify-between text-xs sm:text-sm font-medium transition-all text-right cursor-pointer outline-none shadow-sm`}
      >
        <span className="truncate">{value || "اختر..."}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180 text-[#FFC500]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 w-full bg-[#0D121F] border border-slate-700/90 rounded-xl shadow-2xl z-50 py-1 max-h-56 overflow-y-auto divide-y divide-slate-800/50">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#FFC500]/15 text-[#FFC500] font-bold"
                    : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check size={14} className="text-[#FFC500] shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};



interface PublicAddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: JobFormData) => Promise<{ success: boolean; error?: string }>;
}

export const PublicAddJobModal: React.FC<PublicAddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حقول الوظيفة المعتمدة للموقع العام
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState(SECTORS[0]);
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXP_LEVELS[2]);
  const [vacanciesCount, setVacanciesCount] = useState(1);
  const [gender, setGender] = useState("الكل (ذكور وإناث)");
  const [governorate, setGovernorate] = useState("صنعاء");
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("ريال يمني");
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(true);

  // بيانات مسؤول التوظيف والسياسة
  const [companyName, setCompanyName] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [agreedToEmployerPolicy, setAgreedToEmployerPolicy] = useState(false);

  const getJobCommissionText = () => {
    try {
      const saved = localStorage.getItem('yr_job_commission_config');
      if (saved) {
        const cfg = JSON.parse(saved).employer;
        if (cfg.is_free) return "مجانية بالكامل";
        return `${Number(cfg.amount || 20000).toLocaleString()} ${cfg.currency || "ريال يمني"}`;
      }
    } catch (_) {}
    return "20,000 ريال يمني";
  };
  const jobCommText = getJobCommissionText();

  const handleAddResponsibility = () => setResponsibilities([...responsibilities, ""]);
  const handleRemoveResponsibility = (idx: number) => {
    if (responsibilities.length > 1) setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };
  const handleResponsibilityChange = (val: string, idx: number) => {
    const updated = [...responsibilities];
    updated[idx] = val;
    setResponsibilities(updated);
  };

  const handleAddRequirement = () => setRequirements([...requirements, ""]);
  const handleRemoveRequirement = (idx: number) => {
    if (requirements.length > 1) setRequirements(requirements.filter((_, i) => i !== idx));
  };
  const handleRequirementChange = (val: string, idx: number) => {
    const updated = [...requirements];
    updated[idx] = val;
    setRequirements(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg("يرجى إدخال المسمى الوظيفي أولاً");
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg("يرجى إدخال اسم الشركة / المنشأة");
      return;
    }
    if (employerPhone.replace(/\D/g, '').length !== 9) {
      setErrorMsg("رقم هاتف مسؤول التوظيف يجب أن يتكون من 9 أرقام بالضبط");
      return;
    }
    if (!agreedToEmployerPolicy) {
      setErrorMsg("يرجى الموافقة والالتزام بسياسة عمولة الوساطة لإتمام النشر");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const contactSection = `\n\n--- [بيانات جهة النشر والوساطة] ---\n[معلومات جهة العمل والتواصل]\nاسم المنشأة: ${companyName.trim()}\nهاتف مسؤول التوظيف: ${employerPhone.trim()}\nالبريد الإلكتروني: ${employerEmail.trim() || "غير مسجل"}\nتاريخ الطلب: ${new Date().toLocaleString('ar-YE')}`;

      const payload: JobFormData = {
        title: title.trim(),
        sector,
        workType,
        experienceLevel,
        vacanciesCount: Number(vacanciesCount) || 1,
        companyName: companyName.trim(),
        governorate,
        district: "أمانة العاصمة",
        area: "",
        isRemote,
        description: description.trim() + contactSection,
        responsibilities: responsibilities.filter(r => r.trim() !== ""),
        requirements: requirements.filter(r => r.trim() !== ""),
        salaryMin,
        salaryMax,
        currency,
        isSalaryNegotiable,
        applicationMethod: "التقديم داخل يمن ريتنج",
        contactValue: employerPhone.trim(),
        publishDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isFeatured: false
      };

      const res = await onSubmit(payload);
      if (!res.success) {
        setErrorMsg(res.error || "حدث خطأ أثناء حفظ الشاغر");
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشلت العملية، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-2 sm:p-4 font-['Cairo',sans-serif] text-slate-200" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="min-h-full flex items-center justify-center py-3 sm:py-6">
        <div dir="rtl" className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col my-auto relative overflow-hidden">
          
          {/* ترويسة النموذج */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070A12]/95 backdrop-blur-md rounded-t-2xl shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFC500]/10 text-[#FFC500]">
                  <Briefcase size={20} />
                </span>
                إضافة وظيفة شاغرة
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">طلب نشر شاغر وظيفي جديد عبر منصة يمن ريتنغ</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* محتوى الحقول المخصص للموقع العام */}
          <div className="p-4 sm:p-6 space-y-6 text-sm divide-y divide-slate-800/80">

            {/* ① بيانات الوظيفة الأساسية */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">①</span>
                معلومات الوظيفة الأساسية
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المسمى الوظيفي <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: محاسب مالي، مطور واجهات، مهندس شبكات..."
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">القطاع الوظيفي</label>
                  <CustomSelect value={sector} onChange={setSector} options={SECTORS} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع الدوام</label>
                  <CustomSelect value={workType} onChange={setWorkType} options={WORK_TYPES} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الجنس المطلوب</label>
                  <CustomSelect value={gender} onChange={setGender} options={["الكل (ذكور وإناث)", "ذكور فقط", "إناث فقط"]} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المستوى والخبرة المطلوبة</label>
                  <CustomSelect value={experienceLevel} onChange={setExperienceLevel} options={EXP_LEVELS} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">عدد الشواغر المتاحة</label>
                  <input
                    type="number"
                    min={1}
                    value={vacanciesCount}
                    onChange={e => setVacanciesCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white outline-none text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ② مكان العمل (المحافظة فقط) */}
            <div className="space-y-4 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">②</span>
                  مكان ومقر العمل
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={e => setIsRemote(e.target.checked)}
                    className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">العمل عن بُعد بالكامل (Remote)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المحافظة</label>
                <CustomSelect value={governorate} onChange={setGovernorate} options={YEMEN_GOVS} disabled={isRemote} />
              </div>
            </div>

            {/* ③ الوصف والمسؤوليات والشروط */}
            <div className="space-y-4 pt-5">
              <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">③</span>
                الوصف والمهام والشروط
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف العام للشاغر</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="نبذة عامة وتوضيح عن طبيعة الوظيفة..."
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-3 text-white placeholder-slate-500 outline-none text-xs sm:text-sm resize-none"
                />
              </div>

              {/* المسؤوليات والمهام */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">المسؤوليات والمهام الرئيسية</label>
                {responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={resp}
                      onChange={e => handleResponsibilityChange(e.target.value, idx)}
                      placeholder={`مهمة ${idx + 1}...`}
                      className="flex-1 bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3 py-2 text-white outline-none text-xs"
                    />
                    {responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibility(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="text-xs font-bold text-[#FFC500] hover:text-amber-400 flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus size={14} /> إضافة مسؤولية جديدة
                </button>
              </div>

              {/* الشروط والمتطلبات */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-300">المؤهلات والشروط المطلوبة</label>
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={req}
                      onChange={e => handleRequirementChange(e.target.value, idx)}
                      placeholder={`شرط ${idx + 1}...`}
                      className="flex-1 bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3 py-2 text-white outline-none text-xs"
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="text-xs font-bold text-[#FFC500] hover:text-amber-400 flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus size={14} /> إضافة شرط جديد
                </button>
              </div>
            </div>

            {/* ④ الراتب والمزايا */}
            <div className="space-y-4 pt-5">
              <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">④</span>
                المقابل المالي والراتب
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">من (الحد الأدنى)</label>
                  <input
                    type="text"
                    value={salaryMin}
                    onChange={e => setSalaryMin(e.target.value)}
                    placeholder="مثال: 300,000"
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">إلى (الحد الأعلى)</label>
                  <input
                    type="text"
                    value={salaryMax}
                    onChange={e => setSalaryMax(e.target.value)}
                    placeholder="مثال: 500,000"
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العملة</label>
                  <CustomSelect value={currency} onChange={setCurrency} options={CURRENCIES} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSalaryNegotiable}
                  onChange={e => setIsSalaryNegotiable(e.target.checked)}
                  className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-bold">الراتب قابل للتفاوض حسب الكفاءة والخبرة</span>
              </label>
            </div>

            {/* ⑤ بيانات جهة العمل والتواصل والوساطة السرية */}
            <div className="p-4 bg-[#070A12] border border-amber-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 size={15} className="text-[#FFC500]" />
                  بيانات المنشأة والتواصل ومسؤول التوظيف
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[#FFC500] text-[10px] font-bold">
                  <Lock size={10} /> سرية للوساطة ولن تظهر للعامة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    اسم الشركة / جهة العمل <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="مثال: مجموعة هائل سعيد، شركة يمن تيك..."
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    رقم هاتف مسؤول التوظيف <span className="text-rose-400">*</span>
                    <span className="text-slate-400 text-[10px] font-normal mr-1">(9 أرقام)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      maxLength={9}
                      value={employerPhone}
                      onChange={e => setEmployerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="77XXXXXXX"
                      className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <span className="text-[10px] font-mono text-slate-400">+967</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني لمسؤول التوظيف / المنشأة</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={employerEmail}
                    onChange={e => setEmployerEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    إرشادات: هذه البيانات مخصصة لإدارة منصة يمن ريتنغ لتنسيق طلبات المرشحين والمتابعة، ولا تظهر في صفحة تفاصيل الوظيفة للعامة.
                  </span>
                </div>
              </div>
            </div>

            {/* ⑥ سياسة عمولة الوساطة الإلزامية بالخلفية الخضراء الأصلية */}
            <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
              <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                <ShieldCheck size={16} />
                <span>تنبيه إرشادات وسياسة العمولة الإلزامية:</span>
              </div>
              <p className="text-[11px] text-gray-200 leading-relaxed">
                توفر منصة يمن ريتغ خدمة الوساطة والتوظيف للوصول إلى المتقدمين المناسبين، ويتم إشعار صاحب العمل عند قبول المتقدم وبدء عمله. وبتقديم طلب التوظيف، يقرّ صاحب العمل بموافقته على شروط الوساطة، ويلتزم بإبلاغ الموظف وإلزامه بسداد عمولة الوساطة المستحقة للمنصة والبالغة ({jobCommText}) من راتب الشهر الأول، عند إتمام التوظيف وبدء العمل.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToEmployerPolicy}
                  onChange={e => setAgreedToEmployerPolicy(e.target.checked)}
                  className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                />
                <span className="text-[11px] font-bold text-white">
                  أوافق على شروط الوساطة وإلزام سداد عمولة المنصة ({jobCommText})
                </span>
              </label>
            </div>

          </div>

          {/* رسالة الخطأ إن وُجدت */}
          {errorMsg && (
            <div className="mx-6 my-2 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* أزرار الإجراءات السفلية: فقط إلغاء ونشر الوظيفة (بدون حفظ كمسودة) */}
          <div className="sticky bottom-0 z-30 p-4 px-6 border-t border-slate-800 bg-[#070A12]/95 backdrop-blur-md rounded-b-2xl flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isSubmitting || !agreedToEmployerPolicy}
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-1.5 ${
                !agreedToEmployerPolicy || isSubmitting
                  ? "bg-slate-800 text-slate-500 border border-slate-700/60 opacity-50 cursor-not-allowed"
                  : "bg-[#FFC500] hover:bg-amber-400 text-black cursor-pointer shadow-amber-500/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جارٍ النشر...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  نشر الوظيفة
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
