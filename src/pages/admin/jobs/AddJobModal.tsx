import React, { useState, useEffect } from "react";
import { Briefcase, ShieldCheck, Award, X, CheckCircle2, AlertCircle, ChevronDown, Check } from "lucide-react";

export interface NewJobData {
  id?: string;
  title: string;
  category: string;
  jobType: "دوام كامل" | "دوام جزئي" | "عن بعد" | "عقد";
  experience: string;
  gender: "ذكر" | "أنثى" | "لا يشترط";
  education: string;
  salary: number;
  salaryText?: string;
  currency: string;
  city: string;
  description: string;
  requiredSkills: string[];
  employerName: string;
  employerPhone: string;
  employerEmail: string;
  commissionAmount: number;
}

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewJobData) => void;
  initialData?: NewJobData | null;
}

// مكوّن القائمة المنسدلة المخصصة (يلغي تماماً قائمة أندرويد الافتراضية ذات الدوائر)
const CustomSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ label, value, options, onChange, isOpen, onToggle }) => {
  return (
    <div className="relative">
      <label className="text-gray-200 font-bold block mb-1 text-[11px]">{label}</label>
      <button
        type="button"
        onClick={onToggle}
        className="w-full bg-[#111827] border border-[#27303F] rounded-xl h-11 px-3 text-xs font-bold text-white flex items-center justify-between outline-none active:scale-[0.99] transition cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown size={15} className={"text-gray-400 transition-transform duration-200 " + (isOpen ? "rotate-180 text-[#FFC500]" : "")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 z-50 bg-[#111827] border border-[#27303F] rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => { onChange(opt); onToggle(); }}
                className={"px-3 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between transition " + 
                  (isSelected ? "bg-[#FFC500]/15 text-[#FFC500]" : "text-gray-300 hover:bg-[#1F2937] hover:text-white")}
              >
                <span>{opt}</span>
                {isSelected && <Check size={14} className="text-[#FFC500]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "تكنولوجيا ومعلومات",
    jobType: "دوام كامل" as const,
    experience: "1-3 سنوات",
    gender: "لا يشترط" as "ذكر" | "أنثى" | "لا يشترط",
    education: "بكالوريوس",
    currency: "YER",
    city: "صنعاء",
    description: "",
    requiredSkills: "",
    employerName: "",
    employerPhone: "",
    employerEmail: "",
    commissionAmount: 20000,
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(false);
  const [salaryNumber, setSalaryNumber] = useState<number | "">("");
  const [phoneError, setPhoneError] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 3500);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || "تكنولوجيا ومعلومات",
        jobType: initialData.jobType || "دوام كامل",
        experience: initialData.experience || "1-3 سنوات",
        gender: initialData.gender || "لا يشترط",
        education: initialData.education || "بكالوريوس",
        currency: initialData.currency || "YER",
        city: initialData.city || "صنعاء",
        description: initialData.description || "",
        requiredSkills: Array.isArray(initialData.requiredSkills) ? initialData.requiredSkills.join(", ") : "",
        employerName: initialData.employerName || "",
        employerPhone: initialData.employerPhone || "",
        employerEmail: initialData.employerEmail || "",
        commissionAmount: initialData.commissionAmount || 20000,
      });
      if (initialData.salary === 0 || initialData.salaryText === "يُحدد بعد المقابلة") {
        setIsSalaryNegotiable(true);
        setSalaryNumber("");
      } else {
        setIsSalaryNegotiable(false);
        setSalaryNumber(initialData.salary || "");
      }
    } else {
      setFormData({
        title: "", category: "تكنولوجيا ومعلومات", jobType: "دوام كامل",
        experience: "1-3 سنوات", gender: "لا يشترط", education: "بكالوريوس",
        currency: "YER", city: "صنعاء", description: "", requiredSkills: "",
        employerName: "", employerPhone: "", employerEmail: "", commissionAmount: 20000
      });
      setIsSalaryNegotiable(false);
      setSalaryNumber("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 9);
    setFormData({ ...formData, employerPhone: rawVal });

    if (rawVal.length > 0) {
      const valid = ["77", "73", "78", "71"].some(p => rawVal.startsWith(p));
      if (rawVal.length >= 2 && !valid) {
        setPhoneError("الرقم خاطئ: يجب أن يبدأ بـ 77 أو 73 أو 78 أو 71");
      } else if (rawVal.length < 9) {
        setPhoneError("الرقم غير مكتمل: يجب أن يتكون من 9 أرقام تماماً");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validPrefix = ["77", "73", "78", "71"].some(p => formData.employerPhone.startsWith(p));
    if (formData.employerPhone.length !== 9 || !validPrefix) {
      setPhoneError("الرقم خاطئ: يجب أن يتكون من 9 أرقام ويبدأ بـ 77 أو 73 أو 78 أو 71");
      showError("رقم الهاتف غير صحيح: يجب أن يتكون من 9 أرقام ويبدأ بـ 77، 73، 78، أو 71");
      return;
    }

    if (!formData.title.trim() || !formData.employerName.trim()) {
      showError("يرجى تعبئة المسمى الوظيفي واسم المنشأة");
      return;
    }

    const skillsArray = formData.requiredSkills.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    const finalSalary = isSalaryNegotiable ? 0 : (Number(salaryNumber) || 0);
    const salaryDisplayText = isSalaryNegotiable ? "يُحدد بعد المقابلة" : undefined;

    onSubmit({
      id: initialData?.id,
      ...formData,
      salary: finalSalary,
      salaryText: salaryDisplayText,
      requiredSkills: skillsArray.length > 0 ? skillsArray : ["مهارات عامة"],
    });

    setSuccessToast(initialData ? "تم حفظ التعديلات بنجاح!" : "تم نشر الوظيفة في المنصة بنجاح!");
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0F17] border border-[#1F2937] w-full max-h-[92vh] sm:max-w-2xl rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden font-['Cairo',sans-serif] text-white">
        
        {/* شريط الرأس */}
        <div className="sticky top-0 z-10 bg-[#0B0F17]/95 px-5 pt-3 pb-3 border-b border-[#1F2937]">
          <div className="w-10 h-1 bg-gray-600/60 rounded-full mx-auto mb-2 sm:hidden"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFC500]/10 border border-[#FFC500]/30 flex items-center justify-center text-[#FFC500]">
                <Briefcase size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-black">
                {initialData ? "تعديل بيانات الفرصة الوظيفية" : "إدراج فرصة وظيفية جديدة"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#161D2B] text-gray-400 hover:text-white flex items-center justify-center border border-[#1F2937]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* إشعارات النجاح والفشل */}
        {successToast && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in shadow-lg">
            <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in shadow-lg">
            <AlertCircle size={17} className="text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* جسم النموذج */}
        <form onSubmit={handleSubmit} id="add-job-form" className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* قسم بيانات الإدارة السرية */}
          <div className="bg-[#111827] border border-[#1F2937] p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-black text-xs flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#FFC500]" />
                بيانات الإدارة السرية (لحفظ العمولة والتواصل):
              </span>
              <span className="text-[10px] bg-[#16A34A]/20 text-[#16A34A] px-2 py-0.5 rounded-full font-bold border border-[#16A34A]/30">
                حماية العمولة
              </span>
            </div>

            <div>
              <label className="text-gray-200 font-bold block mb-1">اسم المنشأة أو البنك الحقيقي *</label>
              <input
                type="text" required
                value={formData.employerName}
                onChange={e => setFormData({ ...formData, employerName: e.target.value })}
                className="w-full bg-[#0B0F17] border border-[#27303F] rounded-xl h-11 px-3 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-200 font-bold block mb-1">هاتف مسؤول التوظيف (9 أرقام يبدأ بـ 77، 73، 78، 71) *</label>
                <input
                  type="tel" inputMode="tel" required maxLength={9}
                  value={formData.employerPhone}
                  onChange={handlePhoneChange}
                  className={"w-full bg-[#0B0F17] border rounded-xl h-11 px-3 text-sm font-mono outline-none text-left " +
                    (phoneError ? "border-red-500 text-red-400" : "border-[#27303F] text-white focus:border-zinc-500")}
                />
                {phoneError && (
                  <p className="text-red-400 text-[11px] font-bold mt-1 flex items-center gap-1">
                    <AlertCircle size={13} />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-gray-200 font-bold block mb-1">عمولة المنصة الثابتة (ريال يمني)</label>
                <input
                  type="number" inputMode="numeric"
                  value={formData.commissionAmount}
                  onChange={e => setFormData({ ...formData, commissionAmount: Number(e.target.value) })}
                  className="w-full bg-[#0B0F17] border border-[#16A34A]/50 rounded-xl h-11 px-3 text-sm text-[#16A34A] font-bold font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* قسم البيانات العامة للوظيفة */}
          <div className="space-y-3 pt-1">
            <div className="text-gray-300 font-bold flex items-center gap-1.5">
              <Award size={15} className="text-[#FFC500]" />
              <span>تفاصيل الإعلان المعروض للجمهور (محجوب الاسم):</span>
            </div>

            <div>
              <label className="text-gray-200 font-bold block mb-1">المسمى الوظيفي *</label>
              <input
                type="text" required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#111827] border border-[#27303F] rounded-xl h-11 px-3 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>

            {/* القوائم المنسدلة المخصصة بستايل المنصة الكامل */}
            <div className="grid grid-cols-2 gap-2.5">
              <CustomSelect
                label="التصنيف المهني"
                value={formData.category}
                options={["تكنولوجيا ومعلومات", "مالية ومصرفية", "تسويق ومبيعات", "إدارة وموارد بشرية", "صحة وطب", "هندسة ومقاولات"]}
                onChange={val => setFormData({ ...formData, category: val })}
                isOpen={activeDropdown === "category"}
                onToggle={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
              />

              <CustomSelect
                label="المدينة"
                value={formData.city}
                options={["صنعاء", "عدن", "تعز", "حضرموت", "الحديدة", "مأرب"]}
                onChange={val => setFormData({ ...formData, city: val })}
                isOpen={activeDropdown === "city"}
                onToggle={() => setActiveDropdown(activeDropdown === "city" ? null : "city")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <CustomSelect
                label="نوع الدوام"
                value={formData.jobType}
                options={["دوام كامل", "دوام جزئي", "عن بعد", "عقد"]}
                onChange={val => setFormData({ ...formData, jobType: val as any })}
                isOpen={activeDropdown === "jobType"}
                onToggle={() => setActiveDropdown(activeDropdown === "jobType" ? null : "jobType")}
              />

              <CustomSelect
                label="الجنس المطلوب"
                value={formData.gender}
                options={["لا يشترط", "ذكر", "أنثى"]}
                onChange={val => setFormData({ ...formData, gender: val as any })}
                isOpen={activeDropdown === "gender"}
                onToggle={() => setActiveDropdown(activeDropdown === "gender" ? null : "gender")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <CustomSelect
                label="الخبرة المطلوبة"
                value={formData.experience}
                options={["مبتدئ", "1-3 سنوات", "3-5 سنوات", "5+ سنوات"]}
                onChange={val => setFormData({ ...formData, experience: val })}
                isOpen={activeDropdown === "experience"}
                onToggle={() => setActiveDropdown(activeDropdown === "experience" ? null : "experience")}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-200 font-bold block">الراتب المتوقع (ريال)</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-300">
                    <input
                      type="checkbox"
                      checked={isSalaryNegotiable}
                      onChange={e => setIsSalaryNegotiable(e.target.checked)}
                      className="accent-[#FFC500] rounded"
                    />
                    <span>يُحدد بعد المقابلة</span>
                  </label>
                </div>
                <input
                  type="number" inputMode="numeric"
                  disabled={isSalaryNegotiable}
                  value={isSalaryNegotiable ? "" : salaryNumber}
                  onChange={e => setSalaryNumber(e.target.value ? Number(e.target.value) : "")}
                  className={"w-full bg-[#111827] border rounded-xl h-11 px-3 text-sm font-mono outline-none transition " +
                    (isSalaryNegotiable ? "opacity-40 cursor-not-allowed border-[#1F2937]" : "border-[#27303F] text-white focus:border-zinc-500")}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-200 font-bold block mb-1">المهارات المطلوبة (مفصولة بفواصل)</label>
              <input
                type="text"
                value={formData.requiredSkills}
                onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })}
                className="w-full bg-[#111827] border border-[#27303F] rounded-xl h-11 px-3 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="text-gray-200 font-bold block mb-1">الوصف وشروط الوظيفة</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#111827] border border-[#27303F] rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </form>

        {/* أزرار الحفظ والإلغاء */}
        <div className="sticky bottom-0 z-10 bg-[#0B0F17]/95 px-4 py-3 border-t border-[#1F2937] flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-gray-300 bg-[#161D2B] border border-[#1F2937] cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="add-job-form"
            className="flex-[2] py-3 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#FFC500]/15 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>{initialData ? "حفظ التعديلات" : "نشر الوظيفة فوراً"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
