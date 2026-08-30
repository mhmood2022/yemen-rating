import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
  DollarSign,
  Send,
  CheckCircle2,
  Plus,
  Search,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DEMO_JOBS, CURRENT_COMMISSION_POLICY } from '../../data/demoJobs';
import { JobVacancy } from '../../types/jobs';

export const JobsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [jobs, setJobs] = useState<JobVacancy[]>(DEMO_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // نوافذ العرض والتقديم
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // حقول إضافة وظيفة
  const [postTitle, setPostTitle] = useState('');
  const [postCompany, setPostCompany] = useState('');
  const [postPhone, setPostPhone] = useState('');
  const [postCity, setPostCity] = useState('صنعاء');
  const [postSector, setPostSector] = useState('تقنية وبرمجيات');
  const [postWorkType, setPostWorkType] = useState('دوام كامل');
  const [postSalary, setPostSalary] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [employerAgreed, setEmployerAgreed] = useState(false);
  const [postPhoneError, setPostPhoneError] = useState(false);

  // حقول تقديم الباحث عن عمل
  const [applyName, setApplyName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyCity, setApplyCity] = useState('صنعاء');
  const [applyQual, setApplyQual] = useState('');
  const [applySummary, setApplySummary] = useState('');
  const [applicantAgreed, setApplicantAgreed] = useState(false);
  const [applyPhoneError, setApplyPhoneError] = useState(false);

  // 🔒 قفل تمرير خلفية الموقع تلقائياً عند فتح أي نافذة منبثقة
  const isAnyModalOpen = Boolean(selectedJob || isPostJobOpen || isApplyOpen);
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

  // فحص رقم الهاتف اليمني (9 أرقام ويبدأ بـ 7)
  const validateYemenPhone = (phone: string) => {
    return /^7[0-9]{8}$/.test(phone);
  };

  // إرسال وظيفة جديدة
  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYemenPhone(postPhone)) {
      setPostPhoneError(true);
      return;
    }
    setPostPhoneError(false);

    if (CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'employer_only' || CURRENT_COMMISSION_POLICY.payer === 'both')) {
      if (!employerAgreed) {
        alert('يرجى الموافقة على شروط العمولة لإتمام نشر الشاغر.');
        return;
      }
    }

    const newJob: JobVacancy = {
      id: `job_${Date.now()}`,
      title: postTitle.trim(),
      companyName: postCompany.trim(),
      contactPerson: 'مسؤول التوظيف',
      phone: postPhone.trim(),
      locationDetails: postCity,
      city: postCity,
      sector: postSector as any,
      workType: postWorkType as any,
      experienceLevel: 'متوسط (2-4 سنوات)',
      salaryRange: postSalary.trim() ? postSalary.trim() : 'يحدد بعد المقابلة',
      postedDate: 'الآن',
      deadline: 'خلال 30 يوماً',
      description: postDesc.trim(),
      requirements: ['الكفاءة في المهام المطلوبة', 'الالتزام بمعايير العمل المهنية'],
      status: 'active',
      employerAgreedCommission: employerAgreed
    };

    setJobs(prev => [newJob, ...prev]);
    setIsPostJobOpen(false);
    setSuccessToast('تم إرسال الشاغر بنجاح، وسيتم مطابقته مع الكفاءات المسجلة.');
    setTimeout(() => setSuccessToast(null), 4000);

    setPostTitle('');
    setPostCompany('');
    setPostPhone('');
    setPostSalary('');
    setPostDesc('');
    setEmployerAgreed(false);
  };

  // إرسال ملف التقديم
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYemenPhone(applyPhone)) {
      setApplyPhoneError(true);
      return;
    }
    setApplyPhoneError(false);

    if (CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'applicant_only' || CURRENT_COMMISSION_POLICY.payer === 'both')) {
      if (!applicantAgreed) {
        alert('يرجى الموافقة على شروط العمولة لإتمام التقديم.');
        return;
      }
    }

    setIsApplyOpen(false);
    setSelectedJob(null);
    setSuccessToast('تم استلام ملفك بنجاح! سيتم إشعارك فور تطابق مؤهلاتك مع متطلبات الوظيفة.');
    setTimeout(() => setSuccessToast(null), 5000);

    setApplyName('');
    setApplyPhone('');
    setApplyQual('');
    setApplySummary('');
    setApplicantAgreed(false);
  };

  // تصفية الوظائف
  const filteredJobs = jobs.filter(j => {
    if (j.status !== 'active') return false;
    const matchSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.sector.includes(searchQuery);
    const matchCity = selectedCity === 'all' || j.city === selectedCity;
    const matchSector = selectedSector === 'all' || j.sector === selectedSector;
    return matchSearch && matchCity && matchSector;
  });

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans pb-12">
      {/* 1. رأس الصفحة */}
      <div className="bg-zinc-900/70 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-zinc-800 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-700 transition"
                title="رجوع"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">سوق التوظيف والوظائف المعتمدة</h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mr-10">
              فرص عمل حقيقية ونظام تطابق ذكي يربط الكفاءات بالشركات مباشرة
            </p>
          </div>

          <div className="flex items-center gap-2.5 mr-10 sm:mr-0">
            <button
              onClick={() => setIsApplyOpen(true)}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl text-xs sm:text-sm border border-zinc-700 transition shadow"
            >
              تسجيل باحث عن عمل
            </button>
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl text-xs sm:text-sm transition shadow-md shadow-yellow-500/10"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> أضف وظيفة شاغرة
            </button>
          </div>
        </div>
      </div>

      {/* تنبيه النجاح */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. شريط البحث والفلاتر */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-md">
        <div>
          <label className="block text-xs font-bold text-yellow-400 mb-1.5">البحث السريع:</label>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="ابحث بالمسمى أو التخصص..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-yellow-400 mb-1.5">المحافظة / المدينة:</label>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/80 text-xs sm:text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-yellow-400 transition"
          >
            <option value="all">جميع المحافظات</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت - المكلا">حضرموت - المكلا</option>
            <option value="الحديدة">الحديدة</option>
            <option value="مأرب">مأرب</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-yellow-400 mb-1.5">مجال وقطاع العمل:</label>
          <select
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/80 text-xs sm:text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-yellow-400 transition"
          >
            <option value="all">جميع قطاعات العمل</option>
            <option value="تقنية وبرمجيات">تقنية وبرمجيات</option>
            <option value="محاسبة وبنوك">محاسبة وبنوك</option>
            <option value="طب ورعاية صحية">طب ورعاية صحية</option>
            <option value="مبيعات وتسويق">مبيعات وتسويق</option>
            <option value="هندسة ومقاولات">هندسة ومقاولات</option>
            <option value="إدارة وموارد بشرية">إدارة وموارد بشرية</option>
          </select>
        </div>
      </div>

      {/* 3. قائمة كروت الوظائف */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-14 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
            لا توجد شواغر مطابقة لمعايير البحث حالياً.
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                      {job.sector}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {job.workType}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-400">
                      {job.experienceLevel}
                    </span>
                  </div>

                  <h3 className="font-black text-base sm:text-lg text-white leading-snug">{job.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-yellow-400" /> {job.companyName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {job.city}
                    </span>
                    <span className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
                      <DollarSign className="w-3.5 h-3.5 text-yellow-400" /> {job.salaryRange || 'يحدد بعد المقابلة'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-md shadow-yellow-500/10"
                  >
                    عرض التفاصيل والتقديم
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* نافذة تفاصيل الوظيفة (مع زر رجوع أصفر سهمي من المكتبة)    */}
      {/* ========================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-black text-lg text-white">{selectedJob.title}</h3>
                <span className="text-xs text-yellow-400 font-bold mt-0.5 block">{selectedJob.companyName} • {selectedJob.city}</span>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 border border-zinc-800 transition font-bold text-xs"
                title="رجوع"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                <span>رجوع</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-yellow-400 font-bold block text-[11px]">المحافظة:</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedJob.city}</span>
                </div>
                <div>
                  <span className="text-yellow-400 font-bold block text-[11px]">نوع الدوام:</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedJob.workType}</span>
                </div>
                <div>
                  <span className="text-yellow-400 font-bold block text-[11px]">الراتب المتوقع:</span>
                  <span className="font-black text-yellow-400 mt-0.5 block font-mono">
                    {selectedJob.salaryRange || 'يحدد بعد المقابلة'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-yellow-400 block mb-1.5 text-xs">وصف الوظيفة والمهام:</span>
                <p className="text-zinc-200 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-yellow-400 block mb-1.5 text-xs">المتطلبات والشروط:</span>
                <ul className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 space-y-1.5 text-zinc-200 list-disc list-inside">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsApplyOpen(true)}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-md shadow-yellow-500/10"
              >
                قدّم الآن على هذه الوظيفة
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 font-bold rounded-xl text-xs transition"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" /> رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة إضافة وظيفة شاغرة (مع زر رجوع أصفر سهمي)             */}
      {/* ========================================================= */}
      {isPostJobOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-black text-base text-white">إضافة وظيفة شاغرة للجهة</h3>
              </div>
              <button
                onClick={() => setIsPostJobOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 border border-zinc-800 transition font-bold text-xs"
                title="رجوع"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                <span>رجوع</span>
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-yellow-400 mb-1.5">المسمى الوظيفي المطلوب: *</label>
                <input
                  type="text"
                  placeholder="مثال: محاسب قانوني، مهندس برمجيات..."
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-yellow-400 mb-1.5">اسم الجهة / المنشأة: *</label>
                  <input
                    type="text"
                    placeholder="اسم الشركة أو المؤسسة..."
                    value={postCompany}
                    onChange={e => setPostCompany(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yellow-400 mb-1.5">رقم هاتف الاتصال (9 أرقام): *</label>
                  <input
                    type="tel"
                    placeholder="7XXXXXXXX"
                    value={postPhone}
                    onInput={e => {
                      const val = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '').slice(0, 9);
                      setPostPhone(val);
                      if (val.length === 9 && /^7[0-9]{8}$/.test(val)) setPostPhoneError(false);
                    }}
                    className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 font-mono focus:outline-none transition ${
                      postPhoneError ? 'border-rose-500 focus:border-rose-500' : 'border-zinc-700 focus:border-yellow-400'
                    }`}
                    required
                  />
                  {postPhoneError && (
                    <span className="text-[11px] text-rose-400 mt-1 block font-bold">الرقم غير صالح: يجب أن يبدأ بـ 7 ويتكون من 9 أرقام</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-yellow-400 mb-1.5">المحافظة: *</label>
                  <select
                    value={postCity}
                    onChange={e => setPostCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت - المكلا">حضرموت - المكلا</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="مأرب">مأرب</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-yellow-400 mb-1.5">قطاع التخصص: *</label>
                  <select
                    value={postSector}
                    onChange={e => setPostSector(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="تقنية وبرمجيات">تقنية وبرمجيات</option>
                    <option value="محاسبة وبنوك">محاسبة وبنوك</option>
                    <option value="طب ورعاية صحية">طب ورعاية صحية</option>
                    <option value="مبيعات وتسويق">مبيعات وتسويق</option>
                    <option value="هندسة ومقاولات">هندسة ومقاولات</option>
                    <option value="إدارة وموارد بشرية">إدارة وموارد بشرية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-yellow-400 mb-1.5">
                  الراتب الشهري المتوقع (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="اتركه فارغاً إذا كان يحدد بعد المقابلة..."
                  value={postSalary}
                  onChange={e => setPostSalary(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-yellow-400 mb-1.5">الوصف والشروط المطلوبة: *</label>
                <textarea
                  placeholder="اكتب المهام والشروط وسنوات الخبرة المطلوبة..."
                  value={postDesc}
                  onChange={e => setPostDesc(e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition leading-relaxed"
                  required
                />
              </div>

              {/* موافقة العمولة بعد الحقول */}
              {CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'employer_only' || CURRENT_COMMISSION_POLICY.payer === 'both') && (
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-yellow-500/40 space-y-2 mt-3">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    عمولة يمن ريتغ عند نجاح التوظيف: <strong className="text-yellow-400">{CURRENT_COMMISSION_POLICY.percentageValue}% من راتب الشهر الأول</strong>. 
                    تستحق العمولة عند إتمام توظيف موظف عن طريق يمن ريتغ وفق شروط الوظيفة.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={employerAgreed}
                      onChange={e => setEmployerAgreed(e.target.checked)}
                      className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-white text-[11px]">☑ أوافق على عمولة التوظيف وشروطها.</span>
                  </label>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="flex items-center gap-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 font-bold rounded-xl transition"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" /> رجوع
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl transition shadow-md shadow-yellow-500/10"
                >
                  نشر الوظيفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة تقديم الباحث عن عمل (مع زر رجوع أصفر سهمي)           */}
      {/* ========================================================= */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Send className="w-5 h-5" />
                <h3 className="font-black text-base text-white">تسجيل بيانات الباحث عن عمل</h3>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 border border-zinc-800 transition font-bold text-xs"
                title="رجوع"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                <span>رجوع</span>
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-yellow-400 mb-1.5">الاسم الكامل: *</label>
                <input
                  type="text"
                  placeholder="الاسم الثلاثي أو الرباعي..."
                  value={applyName}
                  onChange={e => setApplyName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-yellow-400 mb-1.5">رقم الهاتف (9 أرقام): *</label>
                  <input
                    type="tel"
                    placeholder="7XXXXXXXX"
                    value={applyPhone}
                    onInput={e => {
                      const val = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '').slice(0, 9);
                      setApplyPhone(val);
                      if (val.length === 9 && /^7[0-9]{8}$/.test(val)) setApplyPhoneError(false);
                    }}
                    className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 font-mono focus:outline-none transition ${
                      applyPhoneError ? 'border-rose-500 focus:border-rose-500' : 'border-zinc-700 focus:border-yellow-400'
                    }`}
                    required
                  />
                  {applyPhoneError && (
                    <span className="text-[11px] text-rose-400 mt-1 block font-bold">الرقم غير صالح: يجب أن يبدأ بـ 7 ويتكون من 9 أرقام</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-yellow-400 mb-1.5">المحافظة / الإقامة: *</label>
                  <select
                    value={applyCity}
                    onChange={e => setApplyCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت - المكلا">حضرموت - المكلا</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="مأرب">مأرب</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-yellow-400 mb-1.5">المؤهل والتخصص العلمي: *</label>
                <input
                  type="text"
                  placeholder="مثال: بكالوريوس محاسبة، دبلوم شبكات..."
                  value={applyQual}
                  onChange={e => setApplyQual(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-yellow-400 mb-1.5">الملخص والمهارات والخبرات السابقة: *</label>
                <textarea
                  placeholder="اكتب نبذة عن خبراتك والأنظمة والبرامج التي تتقنها..."
                  value={applySummary}
                  onChange={e => setApplySummary(e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition leading-relaxed"
                  required
                />
              </div>

              {/* موافقة العمولة بعد الحقول */}
              {CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'applicant_only' || CURRENT_COMMISSION_POLICY.payer === 'both') && (
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-yellow-500/40 space-y-2 mt-3">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    عمولة يمن ريتغ عند نجاح التوظيف: <strong className="text-yellow-400">{CURRENT_COMMISSION_POLICY.percentageValue}% من راتب الشهر الأول</strong>. 
                    لا تستحق العمولة إلا في حال قبولك وتوظيفك من خلال يمن ريتغ.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={applicantAgreed}
                      onChange={e => setApplicantAgreed(e.target.checked)}
                      className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-white text-[11px]">☑ أوافق على عمولة التوظيف وشروطها.</span>
                  </label>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="flex items-center gap-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 font-bold rounded-xl transition"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" /> رجوع
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl transition shadow-md shadow-yellow-500/10"
                >
                  إرسال الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
