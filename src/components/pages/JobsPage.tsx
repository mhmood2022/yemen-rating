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
import { BadgeType } from '../common/VerifiedBadge';
import { mapBusinessToPage, BusinessPageRecord } from '../../services/businessPageService';
import {
  XMarketItem, XSearchFilterBar, XFilterModal, XMarketTweetCard,
  XMarketDetailView, YEMEN_GOV_FILTER_OPTIONS
} from '../common/XMarketUI';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'جميع المحافظات' },
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
  { value: 'سقطرى', label: 'سقطرى' },
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
  const [businessesList, setBusinessesList] = useState<BusinessPageRecord[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
      const [{ data, error }, { data: bizData }] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').limit(200),
      ]);

      if (error) throw error;
      if (bizData) setBusinessesList(bizData.map(mapBusinessToPage));
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

  const toJobXItem = (job: any): XMarketItem => {
    const rawDesc = job.description || '';
    const cleanDesc = rawDesc
      .split('--- [بيانات جهة النشر والوساطة] ---')[0]
      .split('[معلومات جهة العمل والتواصل]')[0]
      .split('[ملف الوصف الوظيفي PDF]')[0]
      .trim();
    const companyMatch = rawDesc.match(/اسم المنشأة:\s*(.+)/);
    const phoneMatch = rawDesc.match(/هاتف مسؤول التوظيف:\s*(\d+)/);
    const extractedName = companyMatch ? companyMatch[1].trim() : '';

    const biz =
      businessesList.find((b) => (job.company_id || job.business_id) && b.id === (job.company_id || job.business_id)) ||
      (extractedName ? businessesList.find((b) => b.name.trim() === extractedName) : undefined) ||
      null;

    const jobType = job.type || job.work_type || 'دوام كامل';
    const salary = job.salary || job.salary_range || 'عند المقابلة';
    const phone = biz?.phone || (phoneMatch ? phoneMatch[1] : '') || '';

    return {
      id: job.id,
      detailPath: `/jobs/${job.id}`,
      actionLabel: 'التقديم',
      actionIcon: <Briefcase size={14} />,
      authorName: biz?.name || extractedName || 'جهة توظيف معتمدة',
      authorUsername: biz?.username || job.city || 'jobs',
      authorAvatar: biz?.avatarUrl || '',
      badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none',
      businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
      createdAt: job.created_at,
      title: job.title,
      priceText: salary,
      description: cleanDesc,
      metaParts: [jobType, job.experience || job.experience_level, job.city].filter(Boolean),
      tagLabel: jobType,
      images: [],
      city: job.city,
      phone,
      whatsappText: `مرحباً، أرغب بالتقديم على وظيفة: ${job.title}`,
    };
  };

  const activeFiltersCount = (cityFilter !== 'all' ? 1 : 0) + (workTypeFilter !== 'all' ? 1 : 0);
  const resetFilters = () => { setCityFilter('all'); setWorkTypeFilter('all'); };
  const handleShare = (it: XMarketItem) => {
    navigator.clipboard?.writeText(`${it.title}${it.priceText ? ` - ${it.priceText}` : ''}`);
    setToastMessage('تم نسخ تفاصيل الوظيفة');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "bg-black min-h-screen max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Tahoma'] text-white"}>
      {!embedded && !selectedItem && <AdBanner placementId="4" className="mb-1" />}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{toastMessage}</span>
        </div>
      )}
      {!embedded && !selectedItem && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F3336] pb-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { window.location.href = '/'; }} title="رجوع للرئيسية" className="p-2 rounded-xl bg-black border border-[#2F3336] text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all cursor-pointer">
              <ArrowRight size={16} />
            </button>
            <div className="flex items-center gap-1.5"><Briefcase className="w-5 h-5 text-[#F5C400]" /><h1 className="text-sm sm:text-base font-black text-white">فرص العمل والوظائف</h1></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleOpenAddModal} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs"><Plus size={15} /><span>أضف وظيفة</span></button>
            <button onClick={fetchJobs} disabled={loading} className="p-2 bg-[#111111] border border-[#2F3336] text-slate-300 hover:text-white rounded-xl"><RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} /></button>
          </div>
        </div>
      )}

      {selectedItem ? (
        <XMarketDetailView
          item={selectedItem}
          activeImageIndex={activeImageIndex}
          onChangeImageIndex={setActiveImageIndex}
          onBack={() => setSelectedItem(null)}
          onOpenLightbox={() => {}}
          onShare={() => handleShare(selectedItem)}
        />
      ) : (
        <>
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "bg-[#111111] p-3 rounded-2xl border border-[#2F3336] space-y-2.5"}>
            <XSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="ابحث عن وظيفة أو مدينة..."
              activeFiltersCount={activeFiltersCount}
              onOpenFilter={() => setIsFilterModalOpen(true)}
            />
            {embedded && <AdBanner placementId="4" className="py-0.5" />}
          </div>

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
            <div className="divide-y divide-[#2F3336]/60">
              {filteredJobs.map((job) => {
                const item = toJobXItem(job);
                return (
                  <XMarketTweetCard
                    key={job.id}
                    item={item}
                    onOpenDetail={() => { setSelectedItem(item); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    onOpenImage={() => {}}
                    onShare={() => handleShare(item)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}

          {embedded && !isAddModalOpen && (
            <button onClick={handleOpenAddModal} className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition" title="أضف وظيفة">
              <Plus size={24} className="stroke-[2.2]" />
            </button>
          )}
        </>
      )}

      <XFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="تصفية الوظائف"
        activeFiltersCount={activeFiltersCount}
        onReset={resetFilters}
        resultsCount={filteredJobs.length}
        fields={[
          { label: 'نوع الدوام', value: workTypeFilter, onChange: setWorkTypeFilter, options: WORK_TYPES },
          { label: 'المحافظة', value: cityFilter, onChange: setCityFilter, options: YEMEN_GOV_FILTER_OPTIONS },
        ]}
      />

      <PublicAddJobModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleSaveJobFromModal} />
    </div>
  );
};
