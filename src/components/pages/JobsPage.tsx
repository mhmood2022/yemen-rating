import { PublicAddJobModal } from "../jobs/PublicAddJobModal";
import { JobFormData } from "../../pages/admin/jobs/AddJobModal";
import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X, Building2, MapPin, Coins, PhoneCall, FileText, Lock, Sparkles } from 'lucide-react';
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

export const JobsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    return matchCity && matchType;
  });

  const jobCommissionAmount = commissionSettings?.default_fixed_commission_amount || 20000;
  const jobCommissionCurr = commissionSettings?.default_fixed_commission_currency || 'ريال يمني';
  const jobCommText = `${jobCommissionAmount.toLocaleString()} ${jobCommissionCurr}`;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Cairo'] text-white">
      <AdBanner placementId="4" className="mb-1" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس مع زر أضف وظيفة */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            title="رجوع للرئيسية"
            className="p-2 rounded-xl bg-[#0B0F19] border border-slate-800 text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all cursor-pointer shadow-sm"
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
            className="p-2 bg-[#0D1527] border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
          </button>
        </div>
      </div>

      {/* شريط الفلترة الموحد الأنيق */}
      <div className="bg-[#0D1527] p-3 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <YRSelect
            value={cityFilter}
            options={YEMEN_GOVERNORATES}
            onChange={(val) => setCityFilter(val)}
            placeholder="كل المدن والمحافظات"
          />
          <YRSelect
            value={workTypeFilter}
            options={WORK_TYPES}
            onChange={(val) => setWorkTypeFilter(val)}
            placeholder="كافة أنواع الدوام"
          />
        </div>
        
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري تحميل الوظائف الحقيقية...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-16 text-center bg-[#0D1527] rounded-2xl border border-slate-800 p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-[#F5C400] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد وظائف شاغرة معلنة حالياً</h3>
          <p className="text-xs text-slate-300">كن أول من ينشر شاغراً بالضغط على زر "أضف وظيفة" أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
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
