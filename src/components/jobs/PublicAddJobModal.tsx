import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, ImagePlus, FileText } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getMyBusinessPage } from "../../services/businessPageService";
import { YRSelect } from "../common/YRSelect";
import { NOT_AVAILABLE, RE_GOVERNORATES, getCityOptions, getDistrictOptions } from "../../constants/realEstateOptions";
import {
  JOB_TYPE_OPTIONS, JOB_SECTOR_OPTIONS, getJobTitlesForSector, JOB_VACANCIES_OPTIONS, JOB_WORKPLACE_OPTIONS,
  JOB_EDUCATION_OPTIONS, JOB_EXPERIENCE_OPTIONS, JOB_LANGUAGE_OPTIONS, JOB_GENDER_OPTIONS,
  JOB_AGE_OPTIONS, JOB_NEGOTIABLE_OPTIONS, JOB_HOURS_OPTIONS, JOB_WORK_DAYS_OPTIONS,
  JOB_OFF_DAY_OPTIONS, JOB_APPLY_METHOD_OPTIONS, JOB_NO_EXP_OPTIONS, JOB_STATUS_OPTIONS,
  JOB_BENEFITS_LIST, JOB_DOCS_LIST, getJobMajorOptions, getJobDeptOptions, getJobSkillOptions
} from "../../constants/marketOptions";

export interface JobFormData {
  title: string;
  selectedJobTitle?: string;
  customJobTitle?: string;
  companyId: string;
  companyName: string;
  companyCity: string;
  governorate: string;
  subCity?: string;
  district?: string;
  sector?: string;
  workType: string;
  workplaceType?: string;
  department?: string;
  vacancies?: string;
  education?: string;
  major?: string;
  experienceLevel: string;
  languageLevel?: string;
  skillPick?: string;
  gender?: string;
  ageRange?: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  isSalaryNegotiable: boolean;
  workHours?: string;
  workDays?: string;
  offDay?: string;
  benefits?: string[];
  deadline?: string;
  applyMethod?: string;
  requiredDocs?: string[];
  canWorkNoExp?: string;
  jobStatus?: string;
  imageData?: string;
  docUrl?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

interface PublicAddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<{ success: boolean; error?: string }>;
}

const CURRENCIES = [
  { value: "YER", label: "ريال يمني (ر.ي)" },
  { value: "USD", label: "دولار أمريكي ($)" },
  { value: "SAR", label: "ريال سعودي (ر.س)" },
];

export const PublicAddJobModal: React.FC<PublicAddJobModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const defaultSector = "الإدارة والأعمال";
  const defaultTitle = getJobTitlesForSector(defaultSector)[0]?.value || "مدير عام";

  const [formData, setFormData] = useState<JobFormData>({
    title: defaultTitle, selectedJobTitle: defaultTitle, customJobTitle: "",
    companyId: "", companyName: "", companyCity: "",
    governorate: "صنعاء", subCity: "أمانة العاصمة", district: "السبعين",
    sector: defaultSector, workType: "دوام كامل",
    workplaceType: "مقر الشركة", department: "غير محدد", vacancies: "1",
    education: "غير محدد", major: "غير محدد", experienceLevel: "غير محدد",
    languageLevel: "غير محدد", skillPick: "الالتزام والانضباط المهني",
    gender: "غير محدد", ageRange: "غير محدد",
    salaryMin: "", salaryMax: "", currency: "YER", isSalaryNegotiable: false,
    workHours: "صباحي", workDays: "غير محدد", offDay: "الجمعة",
    benefits: [], deadline: "", applyMethod: "من خلال يمن ريتنج",
    requiredDocs: ["سيرة ذاتية"], canWorkNoExp: "نعم", jobStatus: "متاحة",
    imageData: "", docUrl: "", description: "", requirements: [], responsibilities: [],
  });

  const [myBiz, setMyBiz] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const imgRef = useRef<HTMLInputElement | null>(null);

  const jobTitleOptions = useMemo(() => getJobTitlesForSector(formData.sector || defaultSector), [formData.sector]);
  const cityOptions = useMemo(() => getCityOptions(formData.governorate), [formData.governorate]);
  const districtOptions = useMemo(() => getDistrictOptions(formData.governorate), [formData.governorate]);
  const majorOptions = useMemo(() => getJobMajorOptions(formData.sector || ""), [formData.sector]);
  const deptOptions = useMemo(() => getJobDeptOptions(formData.sector || ""), [formData.sector]);
  const skillOptions = useMemo(() => getJobSkillOptions(formData.sector || ""), [formData.sector]);

  const isTrainingOrNoExp = formData.workType === "تدريب" || formData.workType === "تدريب مع إمكانية التوظيف" || formData.canWorkNoExp === "نعم";
  const isRemoteWork = formData.workType === "عمل عن بُعد" || formData.workplaceType === "عن بُعد";

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user || !active) return;
      const biz = await getMyBusinessPage(session.user.id);
      if (biz && active) {
        const g = biz.city || "صنعاء";
        setMyBiz(biz);
        setFormData(prev => ({
          ...prev,
          companyId: biz.id, companyName: biz.name, companyCity: g,
          governorate: g, subCity: getCityOptions(g)[0]?.value || g, district: getDistrictOptions(g)[0]?.value || NOT_AVAILABLE,
        }));
      }
    });
    return () => { active = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const fmtAmt = (v: string) => {
    const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  const toggleItem = (field: 'benefits' | 'requiredDocs', val: string) => {
    setFormData(prev => {
      const list = prev[field] || [];
      return { ...prev, [field]: list.includes(val) ? list.filter(x => x !== val) : [...list, val] };
    });
  };

  const handleSectorChange = (sec: string) => {
    const firstTitle = getJobTitlesForSector(sec)[0]?.value || "أخرى";
    setFormData(prev => ({
      ...prev,
      sector: sec,
      selectedJobTitle: firstTitle,
      title: firstTitle === "أخرى" ? (prev.customJobTitle || "") : firstTitle,
      major: getJobMajorOptions(sec)[0]?.value || NOT_AVAILABLE,
      department: getJobDeptOptions(sec)[0]?.value || NOT_AVAILABLE,
      skillPick: getJobSkillOptions(sec)[0]?.value || NOT_AVAILABLE,
    }));
  };

  const handleTitleSelect = (picked: string) => {
    setFormData(prev => ({
      ...prev,
      selectedJobTitle: picked,
      title: picked === "أخرى" ? (prev.customJobTitle || "") : picked,
    }));
  };

  const handleGovChange = (gov: string) => {
    setFormData(prev => ({
      ...prev,
      governorate: gov,
      subCity: getCityOptions(gov)[0]?.value || gov,
      district: getDistrictOptions(gov)[0]?.value || NOT_AVAILABLE,
    }));
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        const M = 900; let w = img.width, h = img.height;
        if (w > h && w > M) { h = Math.round(h * M / w); w = M; }
        else if (h > M) { w = Math.round(w * M / h); h = M; }
        cv.width = w; cv.height = h;
        cv.getContext('2d')?.drawImage(img, 0, 0, w, h);
        setFormData(prev => ({ ...prev, imageData: cv.toDataURL('image/jpeg', 0.72) }));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalTitle = formData.selectedJobTitle === "أخرى"
      ? (formData.customJobTitle || "").trim()
      : (formData.selectedJobTitle || formData.title || "").trim();
    if (!finalTitle) { setError("يرجى اختيار أو كتابة المسمى الوظيفي"); return; }
    if (!agreed) { setError("يرجى الموافقة على شروط وسياسة وساطة يمن ريتغ"); return; }
    setSubmitting(true);
    const res = await onSubmit({ ...formData, title: finalTitle });
    setSubmitting(false);
    if (res.success) {
      setAgreed(false);
      onClose();
    } else {
      setError(res.error || "تعذر حفظ الوظيفة");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black sm:bg-black/80 flex items-center justify-center sm:p-4" dir="rtl" onClick={onClose}>
      <div className="bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden text-white font-['Tahoma',sans-serif]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#2F3336]/60 shrink-0">
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white"><X size={18} /></button>
          <span className="text-[13px] font-bold text-[#71767B]">إضافة شاغر وظيفي</span>
          <span className="w-7" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {error && <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 font-bold">{error}</div>}
          {myBiz && (
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-[#2F3336] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 font-bold">{myBiz.avatarUrl ? <img src={myBiz.avatarUrl} alt={myBiz.name} className="w-full h-full object-cover" /> : myBiz.name?.[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate">{myBiz.name}</div>
                <div className="text-[11px] text-[#71767B] truncate" dir="ltr">@{myBiz.username}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">صفحة المنشأة</span>
            </div>
          )}

          {/* اختيار الوظيفة على مرحلتين: 1) المجال الوظيفي 2) المسمى التابع للمجال */}
          <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
            <div className="text-[11px] font-bold text-[#FFC500]">1. المجال والمسمى الوظيفي</div>
            <div>
              <label className="text-[10.5px] text-[#71767B] block mb-1">المجال الوظيفي *</label>
              <YRSelect searchable value={formData.sector || defaultSector} options={JOB_SECTOR_OPTIONS} onChange={handleSectorChange} />
            </div>
            <div>
              <label className="text-[10.5px] text-[#71767B] block mb-1">المسمى الوظيفي (حسب المجال المختار) *</label>
              <YRSelect searchable value={formData.selectedJobTitle || ""} options={jobTitleOptions} onChange={handleTitleSelect} />
            </div>
            {formData.selectedJobTitle === "أخرى" && (
              <div>
                <label className="text-[10.5px] text-[#FFC500] block mb-1">اكتب المسمى الوظيفي *</label>
                <input
                  required
                  type="text"
                  value={formData.customJobTitle || ""}
                  onChange={(e) => setFormData({ ...formData, customJobTitle: e.target.value, title: e.target.value })}
                  placeholder="اكتب المسمى الوظيفي غير الموجود في القائمة..."
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-white outline-none caret-white"
                />
              </div>
            )}
          </div>

          {!myBiz && (
            <div>
              <label className="text-[11px] text-[#71767B] block mb-1">اسم المنشأة أو جهة العمل (اختياري)</label>
              <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="اسم الشركة أو الجهة..." className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-white outline-none caret-white" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع الوظيفة *</label><YRSelect compact value={formData.workType} options={JOB_TYPE_OPTIONS} onChange={(val) => setFormData({ ...formData, workType: val, workplaceType: val === 'عمل عن بُعد' ? 'عن بُعد' : formData.workplaceType })} /></div>
            <div><label className="text-[10.5px] text-[#71767B] block mb-1">طبيعة مكان العمل</label><YRSelect compact value={formData.workplaceType || ''} options={JOB_WORKPLACE_OPTIONS} onChange={(val) => setFormData({ ...formData, workplaceType: val })} /></div>
            <div><label className="text-[10.5px] text-[#71767B] block mb-1">عدد الشواغر</label><YRSelect compact value={formData.vacancies || '1'} options={JOB_VACANCIES_OPTIONS} onChange={(val) => setFormData({ ...formData, vacancies: val })} /></div>
            <div><label className="text-[10.5px] text-[#71767B] block mb-1">القسم التابع له</label><YRSelect compact searchable value={formData.department || ''} options={deptOptions} onChange={(val) => setFormData({ ...formData, department: val })} /></div>
          </div>

          {!isRemoteWork && (
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">المحافظة</label><YRSelect compact searchable value={formData.governorate} options={RE_GOVERNORATES.map((g) => ({ value: g, label: g }))} onChange={handleGovChange} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">المدينة</label><YRSelect compact value={formData.subCity || ''} options={cityOptions} onChange={(val) => setFormData({ ...formData, subCity: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">المديرية</label><YRSelect compact value={formData.district || ''} options={districtOptions} onChange={(val) => setFormData({ ...formData, district: val })} /></div>
            </div>
          )}

          {/* المؤهلات والخبرات */}
          <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
            <div className="text-[11px] font-bold text-[#FFC500]">المؤهلات والخبرات</div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">المستوى التعليمي</label><YRSelect compact value={formData.education || ''} options={JOB_EDUCATION_OPTIONS} onChange={(val) => setFormData({ ...formData, education: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">التخصص الدراسي</label><YRSelect compact searchable value={formData.major || ''} options={majorOptions} onChange={(val) => setFormData({ ...formData, major: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">العمل دون خبرة</label><YRSelect compact value={formData.canWorkNoExp || ''} options={JOB_NO_EXP_OPTIONS} onChange={(val) => setFormData({ ...formData, canWorkNoExp: val })} /></div>
              {!isTrainingOrNoExp && (
                <div><label className="text-[10.5px] text-[#71767B] block mb-1">سنوات الخبرة</label><YRSelect compact value={formData.experienceLevel} options={JOB_EXPERIENCE_OPTIONS} onChange={(val) => setFormData({ ...formData, experienceLevel: val })} /></div>
              )}
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">مستوى اللغة</label><YRSelect compact value={formData.languageLevel || ''} options={JOB_LANGUAGE_OPTIONS} onChange={(val) => setFormData({ ...formData, languageLevel: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">الجنس</label><YRSelect compact value={formData.gender || ''} options={JOB_GENDER_OPTIONS} onChange={(val) => setFormData({ ...formData, gender: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">الفئة العمرية</label><YRSelect compact value={formData.ageRange || ''} options={JOB_AGE_OPTIONS} onChange={(val) => setFormData({ ...formData, ageRange: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">المهارة المطلوبة</label><YRSelect compact searchable value={formData.skillPick || ''} options={skillOptions} onChange={(val) => setFormData({ ...formData, skillPick: val })} /></div>
            </div>
          </div>

          {/* تفاصيل العمل والراتب */}
          <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
            <div className="text-[11px] font-bold text-[#FFC500]">تفاصيل العمل والراتب</div>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" inputMode="numeric" value={formData.salaryMin} onChange={(e) => setFormData({ ...formData, salaryMin: fmtAmt(e.target.value) })} placeholder="أقل راتب" className="bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-white font-mono outline-none caret-white" />
              <input type="text" inputMode="numeric" value={formData.salaryMax} onChange={(e) => setFormData({ ...formData, salaryMax: fmtAmt(e.target.value) })} placeholder="أعلى راتب" className="bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-white font-mono outline-none caret-white" />
              <YRSelect compact value={formData.currency} options={CURRENCIES} onChange={(val) => setFormData({ ...formData, currency: val })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">قابل للتفاوض</label><YRSelect compact value={formData.isSalaryNegotiable ? 'نعم' : 'لا'} options={JOB_NEGOTIABLE_OPTIONS} onChange={(val) => setFormData({ ...formData, isSalaryNegotiable: val === 'نعم' })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">ساعات العمل</label><YRSelect compact value={formData.workHours || ''} options={JOB_HOURS_OPTIONS} onChange={(val) => setFormData({ ...formData, workHours: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">أيام العمل</label><YRSelect compact value={formData.workDays || ''} options={JOB_WORK_DAYS_OPTIONS} onChange={(val) => setFormData({ ...formData, workDays: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">الإجازة الأسبوعية</label><YRSelect compact value={formData.offDay || ''} options={JOB_OFF_DAY_OPTIONS} onChange={(val) => setFormData({ ...formData, offDay: val })} /></div>
            </div>
            <div>
              <label className="text-[10.5px] text-[#71767B] block mb-1.5">المزايا (اختيار متعدد)</label>
              <div className="flex flex-wrap gap-1.5">
                {JOB_BENEFITS_LIST.map((b) => {
                  const active = (formData.benefits || []).includes(b);
                  return <button key={b} type="button" onClick={() => toggleItem('benefits', b)} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${active ? 'bg-white text-black border-white' : 'bg-black text-[#8B98A5] border-[#2F3336]'}`}>{b}</button>;
                })}
              </div>
            </div>
          </div>

          {/* شروط التقديم والمرفقات */}
          <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
            <div className="text-[11px] font-bold text-[#FFC500]">شروط التقديم والمرفقات</div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">طريقة التقديم</label><YRSelect compact value={formData.applyMethod || ''} options={JOB_APPLY_METHOD_OPTIONS} onChange={(val) => setFormData({ ...formData, applyMethod: val })} /></div>
              <div><label className="text-[10.5px] text-[#71767B] block mb-1">حالة الوظيفة</label><YRSelect compact value={formData.jobStatus || 'متاحة'} options={JOB_STATUS_OPTIONS} onChange={(val) => setFormData({ ...formData, jobStatus: val })} /></div>
              <div className="col-span-2"><label className="text-[10.5px] text-[#71767B] block mb-1">آخر موعد للتقديم (اختياري)</label><input type="date" value={formData.deadline || ''} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-black border border-[#2F3336] rounded-xl p-2 text-xs text-white outline-none" /></div>
            </div>
            <div>
              <label className="text-[10.5px] text-[#71767B] block mb-1.5">المستندات المطلوبة</label>
              <div className="flex flex-wrap gap-1.5">
                {JOB_DOCS_LIST.map((d) => {
                  const active = (formData.requiredDocs || []).includes(d);
                  return <button key={d} type="button" onClick={() => toggleItem('requiredDocs', d)} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${active ? 'bg-white text-black border-white' : 'bg-black text-[#8B98A5] border-[#2F3336]'}`}>{d}</button>;
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <input type="file" accept="image/*" ref={imgRef} onChange={handleImagePick} className="hidden" />
                <button type="button" onClick={() => imgRef.current?.click()} className={`w-full py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${formData.imageData ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-[#2F3336] bg-black text-white'}`}>
                  <ImagePlus size={14} className="text-[#FFC500]" /><span>{formData.imageData ? 'تم إرفاق صورة' : 'صورة إعلان (اختياري)'}</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 bg-black border border-[#2F3336] rounded-xl px-2">
                <FileText size={13} className="text-[#FFC500] shrink-0" />
                <input type="url" value={formData.docUrl || ''} onChange={(e) => setFormData({ ...formData, docUrl: e.target.value })} placeholder="رابط ملف وصف (اختياري)" className="w-full bg-transparent text-[11px] text-white outline-none caret-white py-2" />
              </div>
            </div>
          </div>

          <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="وصف إضافي أو مهام الوظيفة (اختياري)..." className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-white outline-none resize-none caret-white" />
          <label className="flex items-center gap-2 text-[11px] text-[#71767B] cursor-pointer"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-[#16A34A]" /><span>أوافق على شروط وسياسة وساطة يمن ريتغ</span></label>
          <button type="submit" disabled={submitting || !agreed} className="w-full py-2.5 rounded-full bg-[#FFC500] disabled:opacity-40 text-black font-black text-xs">{submitting ? "جاري النشر..." : "نشر الوظيفة"}</button>
        </form>
      </div>
    </div>
  );
};
