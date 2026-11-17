import { PublicAddJobModal } from "../jobs/PublicAddJobModal";
import { JobFormData } from "../../pages/admin/jobs/AddJobModal";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X, Building2, MapPin, Coins, PhoneCall, FileText, Lock, Sparkles, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminAuctionsService } from '../../services/adminService';
import { AdBanner } from '../common/AdBanner';
import { JobCard } from '../jobs/JobCard';
import { YRSelect } from '../common/YRSelect';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'كل المدن والمحافظات' },
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'صعدة', label: 'صعدة' },
  { value: 'حجة', label: 'حجة' },
  { value: 'البيضاء', label: 'البيضاء' },
  { value: 'لحج', label: 'لحج' },
  { value: 'أبين', label: 'أبين' },
  { value: 'المهرة', label: 'المهرة' },
  { value: 'شبوة', label: 'شبوة' },
  { value: 'عمران', label: 'عمران' },
  { value: 'الضالع', label: 'الضالع' },
  { value: 'ريمة', label: 'ريمة' },
  { value: 'المحويت', label: 'المحويت' },
  { value: 'سقطرى', label: 'أرخبيل سقطرى' },
  { value: 'الجوف', label: 'الجوف' }
];

const WORK_TYPES = [
  { value: 'all', label: 'كافة أنواع الدوام' },
  { value: 'دوام كامل', label: 'دوام كامل' },
  { value: 'دوام جزئي', label: 'دوام جزئي' },
  { value: 'عن بعد', label: 'عن بعد' },
  { value: 'عقد', label: 'عقد' }
];

const SECTORS = [
  { value: 'إدارية ومحاسبة', label: 'إدارية ومحاسبة' },
  { value: 'تقنية معلومات وبرمجة', label: 'تقنية معلومات وبرمجة' },
  { value: 'تسويق ومبيعات', label: 'تسويق ومبيعات' },
  { value: 'هندسة وتصميم', label: 'هندسة وتصميم' },
  { value: 'طب وصيدلة', label: 'طب وصيدلة' },
  { value: 'خدمات عامة', label: 'خدمات عامة' }
];

export const JobsPage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({ onBack, embedded = false }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');

  const [commissionSettings, setCommissionSettings] = useState<any>(null);

  // نافذة أضف وظيفة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSector, setNewSector] = useState('إدارية ومحاسبة');
  const [newWorkType, setNewWorkType] = useState('دوام كامل');
  const [newCity, setNewCity] = useState('صنعاء');
  const [newSalaryRange, setNewSalaryRange] = useState('');
  const [newExperienceLevel, setNewExperienceLevel] = useState('1-3 سنوات');
  const [newDescription, setNewDescription] = useState('');
  const [employerPhone, setEmployerPhone] = useState('');
  const [agreedToEmployerPolicy, setAgreedToEmployerPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    adminAuctionsService.getPlatformCommissionSettings?.().then((res: any) => {
      if (res?.data) setCommissionSettings(res.data);
    }).catch(() => {});
  }, []);

  const handleOpenAddModal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول إلى حسابك أولاً لتتمكن من إضافة شاغر وظيفي');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setEmployerPhone(numeric);
  };

  
  const handleSaveJobFromModal = async (newJob: JobFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      let salaryText = "";
      if (newJob.salaryMin || newJob.salaryMax) {
        salaryText = `${newJob.salaryMin || "0"} - ${newJob.salaryMax || ""} ${newJob.currency || "YER"}`;
        if (newJob.isSalaryNegotiable) salaryText += " (قابل للتفاوض)";
      }

      const payload: any = {
        title: (newJob.title || "").trim(),
        company_id: newJob.companyId || null,
        city: (newJob.governorate || newJob.companyCity || "صنعاء").trim(),
        salary: salaryText || null,
        type: newJob.workType || "دوام كامل",
        experience: newJob.experienceLevel || "متوسط (2-4 سنوات)",
        description: (newJob.description || "").trim(),
        requirements: Array.isArray(newJob.requirements) ? newJob.requirements : [],
        skills: Array.isArray(newJob.responsibilities) ? newJob.responsibilities : [],
        status: "PUBLISHED",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from("jobs").insert([payload]).select();
      if (error) throw error;

      if (data && data[0]) {
        setJobs(prev => [data[0], ...prev]);
      }
      setIsAddModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error("Save job error:", err);
      return { success: false, error: err.message || "حدث خطأ أثناء حفظ الشاغر الوظيفي" };
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !agreedToEmployerPolicy) return;

    if (employerPhone.length !== 9) {
      setToastMessage('يرجى إدخال رقم هاتف مسؤول التوظيف (9 أرقام بالضبط)');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول أولاً لإرسال الوظيفة');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        title: newTitle.trim(),
        sector: newSector,
        work_type: newWorkType,
        city: newCity,
        salary_range: newSalaryRange.trim() || 'بحسب المقابلة والخبرة',
        experience_level: newExperienceLevel,
        description: newDescription.trim(),
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('jobs').insert([payload]);
      if (error) throw error;

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSalaryRange('');
      setNewDescription('');
      setEmployerPhone('');
      setAgreedToEmployerPolicy(false);
      setToastMessage('تم نشر الوظيفة بنجاح وتوثيق عمولة ووساطة يمن ريتغ');
      setTimeout(() => setToastMessage(null), 4000);
      fetchJobs();
    } catch (err: any) {
      setToastMessage(err.message || 'حدث خطأ أثناء إرسال الوظيفة');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const workType = job.work_type || job.workType;
    const matchCity = cityFilter === 'all' || (job.city && job.city.includes(cityFilter));
    const matchType = workTypeFilter === 'all' || workType === workTypeFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || (job.title || '').toLowerCase().includes(q) || (job.description || '').toLowerCase().includes(q) || (job.city || '').toLowerCase().includes(q);
    return matchCity && matchType && matchSearch;
  });

  const jobCommissionAmount = commissionSettings?.default_fixed_commission_amount || 20000;
  const jobCommissionCurr = commissionSettings?.default_fixed_commission_currency || 'ريال يمني';
  const jobCommText = `${jobCommissionAmount.toLocaleString()} ${jobCommissionCurr}`;

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "bg-black min-h-screen max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Tahoma'] text-white"}>
      {!embedded && <AdBanner placementId="4" className="mb-1" />}

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F3336] pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              title="رجوع للرئيسية"
              className="p-2 rounded-xl bg-black border border-[#2F3336] text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all cursor-pointer shadow-sm"
            >
              <ArrowRight size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-5 h-5 text-[#F5C400]" />
              <h1 className="text-sm sm:text-base font-black text-white">فرص العمل والوظائف</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs transition-colors shadow-md"
            >
              <Plus size={15} />
              <span>أضف وظيفة</span>
            </button>

            <button
              onClick={fetchJobs}
              disabled={loading}
              className="p-2 bg-[#111111] border border-[#2F3336] text-slate-300 hover:text-white rounded-xl transition-colors"
              title="تحديث"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
            </button>
          </div>
        </div>
      )}

      {/* الرأس الموحد: بحث + إعلان راعي + فلتر */}
      <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "bg-[#111111] p-3 rounded-2xl border border-[#2F3336] space-y-2.5"}>
        <div className="flex items-center bg-black border border-[#2F3336] focus-within:border-white rounded-full px-3.5 py-1.5 transition-colors">
          <Search size={15} className="text-[#71767B] ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن وظيفة أو مدينة..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder-[#71767B] outline-none caret-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#71767B] hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>

        {embedded && <AdBanner placementId="4" className="py-0.5" />}

        <div className="grid grid-cols-2 gap-2">
          <YRSelect
            value={cityFilter}
            options={YEMEN_GOVERNORATES}
            onChange={(val) => setCityFilter(val)}
            placeholder="كل المحافظات"
          />
          <YRSelect
            value={workTypeFilter}
            options={WORK_TYPES}
            onChange={(val) => setWorkTypeFilter(val)}
            placeholder="نوع الدوام"
          />
        </div>
      </div>

      {/* المحتوى بأسلوب تغريدات X */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#71767B] gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#FFC500] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري تحميل الوظائف...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-16 text-center text-[#71767B] p-6 space-y-2">
          <AlertCircle className="w-9 h-9 text-[#FFC500] mx-auto opacity-75" />
          <h3 className="text-sm font-bold text-white">لا توجد وظائف شاغرة حالياً</h3>
          <p className="text-xs">اضغط على زر + لإضافة فرصة عمل جديدة.</p>
        </div>
      ) : embedded ? (
        <div className="divide-y divide-[#2F3336]/40">
          {filteredJobs.map((job) => {
            const cleanDesc = (job.description || '').split('--- [بيانات جهة النشر والوساطة] ---')[0].split('[معلومات جهة العمل والتواصل]')[0].split('[ملف الوصف الوظيفي PDF]')[0].trim();
            const jobType = job.type || job.work_type || 'دوام كامل';
            const salary = job.salary || job.salary_range || 'عند المقابلة';
            return (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="p-3 bg-black hover:bg-white/[0.03] transition flex gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 text-[#FFC500]">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap text-[13px]">
                    <span className="font-bold text-white truncate max-w-[200px]">{job.title}</span>
                    <ShieldCheck size={14} className="text-[#FFC500] shrink-0" />
                    <span className="text-[#71767B] text-[12px]">@{job.city || 'اليمن'} · {jobType}</span>
                  </div>
                  {cleanDesc && (
                    <p className="mt-1 text-[13.5px] text-[#E7E9EA] leading-relaxed line-clamp-2">
                      {cleanDesc}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[12px] text-[#71767B]">
                    <span className="text-[#FFC500] font-bold">{salary}</span>
                    <span className="text-white/80 font-bold">عرض والتقديم ←</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {embedded && !isAddModalOpen && (
        <button
          onClick={handleOpenAddModal}
          className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition"
          title="أضف وظيفة"
        >
          <Plus size={24} className="stroke-[2.2]" />
        </button>
      )}

      {/* نافذة أضف وظيفة - القالب الفاخر المعتمد 842 سطراً */}
        <PublicAddJobModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSaveJobFromModal}
        />
    </div>
  );
};
