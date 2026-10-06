import React, { useState, useEffect, useRef } from "react";
import { X, Briefcase, Building2, MapPin, DollarSign, Calendar, Send, Plus, Trash2, Star, Search, CheckCircle2, ChevronDown, Check, Globe, Mail, Phone, AlertCircle, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { supabase } from "../../../lib/supabase";

export interface JobFormData {
  id?: string;
  title: string;
  sector: string;
  workType: string;
  experienceLevel: string;
  vacanciesCount: number;
  companyId?: string;
  companyName: string;
  companyRating?: number;
  companyCity?: string;
  companyLogo?: string;
  governorate: string;
  district: string;
  area: string;
  isRemote: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  salaryMin: string;
  salaryMax: string;
  currency: string;
  isSalaryNegotiable: boolean;
  applicationMethod: string;
  contactValue?: string;
  publishDate: string;
  expiryDate: string;
  isFeatured: boolean;
  showOnHome: boolean;
  isPinned: boolean;
  status: "draft" | "published";
}

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: JobFormData) => Promise<{ success: boolean; error?: string }>;
  initialData?: JobFormData | null;
}

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
const APP_METHODS = [
  "التقديم داخل يمن ريتنج",
  "عبر البريد الإلكتروني",
  "عبر واتساب",
  "رابط موقع خارجي"
];

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

const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
}> = ({ checked, onChange, label, className }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className || ""}`}
    >
      <div
        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
          checked
            ? "bg-[#FFC500] border-[#FFC500] text-black shadow-sm shadow-[#FFC500]/30"
            : "border-slate-700 bg-slate-900/90 group-hover:border-slate-500"
        }`}
      >
        {checked && <Check size={12} strokeWidth={3.5} />}
      </div>
      <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
        {label}
      </div>
    </div>
  );
};

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  if (!isOpen) return null;

  // الحالات
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employerPhone, setEmployerPhone] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [agreedToEmployerPolicy, setAgreedToEmployerPolicy] = useState(false);

  // قراءة عمولة المنشأة المحددة من الإدارة
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

  const [title, setTitle] = useState(initialData?.title || "");
  const [sector, setSector] = useState(initialData?.sector || SECTORS[0]);
  const [workType, setWorkType] = useState(initialData?.workType || WORK_TYPES[0]);
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experienceLevel || EXP_LEVELS[2]);
  const [vacanciesCount, setVacanciesCount] = useState<number>(initialData?.vacanciesCount || 1);

  const [companySearch, setCompanySearch] = useState("");
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [companyResults, setCompanyResults] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<{
    id?: string;
    name: string;
    city?: string;
    rating?: number;
    logo?: string;
  } | null>(initialData?.companyName ? {
    id: initialData.companyId,
    name: initialData.companyName,
    city: initialData.companyCity,
    rating: initialData.companyRating,
    logo: initialData.companyLogo
  } : null);

  const [governorate, setGovernorate] = useState(initialData?.governorate || "صنعاء");
  const [district, setDistrict] = useState(initialData?.district || "أمانة العاصمة");
  const [area, setArea] = useState(initialData?.area || "");
  const [isRemote, setIsRemote] = useState(initialData?.isRemote || false);

  const [description, setDescription] = useState(initialData?.description || "");
  const [responsibilities, setResponsibilities] = useState<string[]>(initialData?.responsibilities?.length ? initialData.responsibilities : [""]);
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements?.length ? initialData.requirements : [""]);

  const [salaryMin, setSalaryMin] = useState(initialData?.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(initialData?.salaryMax || "");
  const [currency, setCurrency] = useState(initialData?.currency || CURRENCIES[0]);
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(initialData?.isSalaryNegotiable || false);

  const [applicationMethod, setApplicationMethod] = useState(initialData?.applicationMethod || APP_METHODS[0]);
  const [contactValue, setContactValue] = useState(initialData?.contactValue || "");

  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || todayStr);
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || nextMonthStr);

  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [showOnHome, setShowOnHome] = useState(initialData?.showOnHome || true);
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);

  useEffect(() => {
    if (!companySearch.trim() || companySearch.length < 2) {
      setCompanyResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingCompany(true);
      try {
        const { data } = await supabase
          .from("businesses")
          .select("id, name, city, rating, logo_url")
          .ilike("name", `%${companySearch.trim()}%`)
          .limit(5);
        setCompanyResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCompany(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [companySearch]);

  const addResponsibility = () => setResponsibilities([...responsibilities, ""]);
  const updateResponsibility = (idx: number, val: string) => {
    const updated = [...responsibilities];
    updated[idx] = val;
    setResponsibilities(updated);
  };
  const removeResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  const addRequirement = () => setRequirements([...requirements, ""]);
  const updateRequirement = (idx: number, val: string) => {
    const updated = [...requirements];
    updated[idx] = val;
    setRequirements(updated);
  };
  const removeRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (targetStatus: "draft" | "published") => {
    if (targetStatus === "published") {
      if (!agreedToEmployerPolicy) {
        setErrorMsg("⚠️ يرجى الإقرار والموافقة على سياسة عمولة الوساطة لنشر الوظيفة.");
        return;
      }
      if (employerPhone && employerPhone.replace(/\D/g, '').length !== 9) {
        setErrorMsg("⚠️ رقم هاتف مسؤول التوظيف يجب أن يتكون من 9 أرقام بالضبط.");
        return;
      }
    }
    if (!title.trim()) {
      setErrorMsg("يرجى إدخال المسمى الوظيفي أولاً");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload: JobFormData = {
        title: title.trim(),
        sector,
        workType,
        experienceLevel,
        vacanciesCount: Number(vacanciesCount) || 1,
        companyId: selectedCompany?.id,
        companyName: selectedCompany ? selectedCompany.name : (companySearch.trim() || "جهة غير محددة"),
        companyRating: selectedCompany?.rating || 4.5,
        companyCity: selectedCompany?.city || governorate,
        companyLogo: selectedCompany?.logo,
        governorate,
        district,
        area,
        isRemote,
        description: description.trim(),
        responsibilities: responsibilities.filter(r => r.trim().length > 0),
        requirements: requirements.filter(r => r.trim().length > 0),
        salaryMin,
        salaryMax,
        currency,
        isSalaryNegotiable,
        applicationMethod,
        contactValue,
        publishDate,
        expiryDate,
        isFeatured,
        showOnHome,
        isPinned,
        status: targetStatus
      };

      const res = await onSubmit(payload);
      
      if (res && res.success === false) {
        setErrorMsg(res.error || "تعذر حفظ الوظيفة، يرجى المحاولة مرة أخرى.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMsg("حدث خطأ غير متوقع أثناء الحفظ.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-2 sm:p-4 font-['Cairo',sans-serif] text-slate-200" style={{ WebkitOverflowScrolling: "touch" }}>
      <div 
        dir="rtl" 
        className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col my-4 sm:my-8 mx-auto relative overflow-hidden"
      >
        {/* رأس النموذج */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070A12] shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFC500]/10 text-[#FFC500]">
                <Briefcase size={20} />
              </span>
              إضافة وظيفة جديدة
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">إنشاء وظيفة وإرسالها للنشر في المنصة</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* جسم النموذج بالتمرير */}
        <div className="p-4 sm:p-6 space-y-6 text-sm divide-y divide-slate-800/80" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
          
          {/* ① معلومات الوظيفة */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">①</span>
              معلومات الوظيفة
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المسمى الوظيفي <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: محاسب مالي أول"
                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">التخصص *</label>
                <CustomSelect
                  value={sector}
                  onChange={setSector}
                  options={SECTORS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع الوظيفة *</label>
                <CustomSelect
                  value={workType}
                  onChange={setWorkType}
                  options={WORK_TYPES}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الخبرة المطلوبة *</label>
                <CustomSelect
                  value={experienceLevel}
                  onChange={setExperienceLevel}
                  options={EXP_LEVELS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عدد الشواغر</label>
                <input
                  type="number"
                  min="1"
                  value={vacanciesCount}
                  onChange={e => setVacanciesCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* ② جهة العمل */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">②</span>
              جهة العمل
            </div>

            {!selectedCompany ? (
              <div className="relative">
                <div className="relative">
                  <Search size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={e => setCompanySearch(e.target.value)}
                    placeholder="🔍 البحث عن منشأة مسجلة في المنصة..."
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-slate-500 outline-none"
                  />
                  {isSearchingCompany && (
                    <span className="absolute left-3.5 top-3 text-xs text-[#FFC500]">جارٍ البحث...</span>
                  )}
                </div>

                {companyResults.length > 0 && (
                  <div className="absolute top-full mt-1.5 w-full bg-[#0D121F] border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800">
                    {companyResults.map(biz => (
                      <div
                        key={biz.id}
                        onClick={() => {
                          setSelectedCompany({
                            id: biz.id,
                            name: biz.name,
                            city: biz.city,
                            rating: biz.rating || 4.5,
                            logo: biz.logo_url
                          });
                          setCompanyResults([]);
                          setCompanySearch("");
                        }}
                        className="flex items-center justify-between p-3 hover:bg-slate-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 size={16} className="text-[#FFC500]" />
                          <div>
                            <span className="font-bold text-white text-xs block">{biz.name}</span>
                            <span className="text-[10px] text-slate-400">{biz.city || "اليمن"}</span>
                          </div>
                        </div>
                        <span className="text-xs text-amber-400 flex items-center gap-1 font-bold">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {biz.rating ? biz.rating.toFixed(1) : "4.5"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#111625] border border-slate-700 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedCompany.logo ? (
                      <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 size={20} className="text-[#FFC500]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{selectedCompany.name}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{selectedCompany.city || "صنعاء"}</span>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        {selectedCompany.rating || 4.5}
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  تغيير المنشأة
                </button>
              </div>
            )}
          </div>

          {/* ③ مكان العمل */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">③</span>
                مكان العمل
              </div>
              <CustomCheckbox
                checked={isRemote}
                onChange={setIsRemote}
                label="عمل عن بُعد بالكامل"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المحافظة *</label>
                <CustomSelect
                  disabled={isRemote}
                  value={governorate}
                  onChange={setGovernorate}
                  options={YEMEN_GOVS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المديرية</label>
                <input
                  type="text"
                  disabled={isRemote}
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="مثال: أمانة العاصمة"
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] disabled:opacity-50 rounded-xl px-3 py-2.5 text-white outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المنطقة / الشارع</label>
                <input
                  type="text"
                  disabled={isRemote}
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="مثال: شارع حدة"
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] disabled:opacity-50 rounded-xl px-3 py-2.5 text-white outline-none text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* ④ وصف الوظيفة */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">④</span>
              وصف الوظيفة
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف العام للوظيفة *</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="اكتب نبذة شاملة عن الوظيفة وأهدافها..."
                className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-3 text-white placeholder-slate-500 outline-none text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">المسؤوليات والمهام</label>
              {responsibilities.map((resp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#FFC500] font-bold">•</span>
                  <input
                    type="text"
                    value={resp}
                    onChange={e => updateResponsibility(i, e.target.value)}
                    placeholder="مثال: إعداد التقارير المالية الدورية..."
                    className="flex-1 bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  {responsibilities.length > 1 && (
                    <button type="button" onClick={() => removeResponsibility(i)} className="text-slate-500 hover:text-red-400 p-1 cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addResponsibility}
                className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <Plus size={13} /> إضافة مسؤولية جديدة
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-300">الشروط والمؤهلات المطلوبة</label>
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#FFC500] font-bold">•</span>
                  <input
                    type="text"
                    value={req}
                    onChange={e => updateRequirement(i, e.target.value)}
                    placeholder="مثال: بكالوريوس محاسبة أو ما يعادلها..."
                    className="flex-1 bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeRequirement(i)} className="text-slate-500 hover:text-red-400 p-1 cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <Plus size={13} /> إضافة شرط جديد
              </button>
            </div>
          </div>

          {/* ⑤ الراتب والمزايا */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">⑤</span>
              الراتب والمزايا
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">من</label>
                <input
                  type="text"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  placeholder="مثال: 300,000"
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3 py-2.5 text-white outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">إلى</label>
                <input
                  type="text"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  placeholder="مثال: 500,000"
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3 py-2.5 text-white outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">العملة</label>
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  options={CURRENCIES}
                />
              </div>
            </div>

            <CustomCheckbox
              checked={isSalaryNegotiable}
              onChange={setIsSalaryNegotiable}
              label="الراتب قابل للتفاوض حسب الكفاءة والخبرة"
            />
          </div>

          {/* ⑥ طريقة التقديم */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">⑥</span>
              طريقة التقديم
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">القناة المعتمدة للتقديم</label>
                <CustomSelect
                  value={applicationMethod}
                  onChange={setApplicationMethod}
                  options={APP_METHODS}
                />
              </div>

              {applicationMethod !== "التقديم داخل يمن ريتنج" && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {applicationMethod.includes("البريد") ? "البريد الإلكتروني للتقديم" : 
                     applicationMethod.includes("واتساب") ? "رقم الواتساب" : "رابط موقع التقديم"}
                  </label>
                  <input
                    type="text"
                    value={contactValue}
                    onChange={e => setContactValue(e.target.value)}
                    placeholder={applicationMethod.includes("البريد") ? "jobs@example.com" : 
                                 applicationMethod.includes("واتساب") ? "967770000000" : "https://..."}
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white outline-none text-xs sm:text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ⑦ مدة الإعلان */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">⑦</span>
              مدة الإعلان
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ النشر</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={e => setPublishDate(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* ⑧ إعدادات الظهور */}
          <div className="space-y-3 pt-5">
            <div className="flex items-center gap-2 text-[#FFC500] font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FFC500]/20 flex items-center justify-center text-xs">⑧</span>
              إعدادات الظهور والترويج
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#111625] border border-slate-800 hover:border-slate-700 transition-colors">
                <CustomCheckbox
                  checked={isFeatured}
                  onChange={setIsFeatured}
                  label="⭐ وظيفة مميزة"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#111625] border border-slate-800 hover:border-slate-700 transition-colors">
                <CustomCheckbox
                  checked={showOnHome}
                  onChange={setShowOnHome}
                  label="🏠 إظهار في الرئيسية"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#111625] border border-slate-800 hover:border-slate-700 transition-colors">
                <CustomCheckbox
                  checked={isPinned}
                  onChange={setIsPinned}
                  label="📌 تثبيت في الأعلى"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 🚨 شريط رسالة الخطأ بالعربي يظهر هنا فوق أزرار الإجراءات مباشرة */}
        {/* قسم بيانات صاحب العمل والتواصل والوساطة السرية */}
            <div className="p-4 bg-[#070A12] border border-amber-500/20 rounded-2xl space-y-3 mx-6 my-3">
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
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
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
                      onChange={(e) => setEmployerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="77XXXXXXX"
                      className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <span className="text-[10px] font-mono text-slate-400">+967</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    البريد الإلكتروني لمسؤول التوظيف / المنشأة
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={employerEmail}
                    onChange={(e) => setEmployerEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    إرشادات: هذه البيانات مخصصة لإدارة منصة يمن ريتنغ لتنسيق طلبات المرشحين والمتابعة، ولا تظهر في صفحة تفاصيل الوظيفة للعامة.
                  </span>
                </div>
              </div>
            </div>

            {/* شرط مقدم التوظيف وسياسة عمولة الوساطة الإلزامية بالخلفية الخضراء الأصلية */}
            <div className="mx-6 my-2 p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
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
                  onChange={(e) => setAgreedToEmployerPolicy(e.target.checked)}
                  className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                />
                <span className="text-[11px] font-bold text-white">
                  أوافق على شروط الوساطة وإلزام سداد عمولة المنصة ({jobCommText})
                </span>
              </label>
            </div>

{errorMsg && (
          <div className="mx-6 my-2 p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2.5 animate-pulse">
            <AlertCircle size={18} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* أزرار الإجراءات السفلية */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#070A12] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("draft")}
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            حفظ كمسودة
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={isSubmitting || !agreedToEmployerPolicy}
              onClick={() => handleSubmit("published")}
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-1.5 ${
                !agreedToEmployerPolicy || isSubmitting
                  ? "bg-slate-800 text-slate-500 border border-slate-700/60 opacity-50 cursor-not-allowed"
                  : "bg-[#FFC500] hover:bg-amber-400 text-black cursor-pointer shadow-amber-500/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جارٍ الحفظ...
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
