import React, { useState } from 'react';
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
  Filter, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Lock,
  Calendar
} from 'lucide-react';
import { 
  DEMO_JOBS, 
  CURRENT_COMMISSION_POLICY, 
  DEMO_SEEKERS, 
  DEMO_MATCH_RECORDS 
} from '../../data/demoJobs';
import { JobVacancy, JobSeekerProfile, JobMatchRecord } from '../../types/jobs';

export const JobsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [jobs, setJobs] = useState<JobVacancy[]>(DEMO_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // نماذج المودال
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobVacancy | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isHireConfirmModalOpen, setIsHireConfirmModalOpen] = useState(false);

  // إشعار نجاح
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // حقول إضافة وظيفة جديدة
  const [postTitle, setPostTitle] = useState('');
  const [postCompany, setPostCompany] = useState('');
  const [postContactPerson, setPostContactPerson] = useState('');
  const [postPhone, setPostPhone] = useState('');
  const [postCity, setPostCity] = useState('صنعاء');
  const [postSector, setPostSector] = useState('تقنية وبرمجيات');
  const [postWorkType, setPostWorkType] = useState('دوام كامل');
  const [postSalary, setPostSalary] = useState(''); // اختياري
  const [postDesc, setPostDesc] = useState('');
  const [postRequirements, setPostRequirements] = useState('');
  const [employerAgreed, setEmployerAgreed] = useState(false);

  // حقول تقديم المتقدم
  const [applyFullName, setApplyFullName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyCity, setApplyCity] = useState('صنعاء');
  const [applyQualification, setApplyQualification] = useState('');
  const [applySpecialization, setApplySpecialization] = useState('تقنية وبرمجيات');
  const [applyExperience, setApplyExperience] = useState('سنتان');
  const [applySkills, setApplySkills] = useState('');
  const [applySummary, setApplySummary] = useState('');
  const [applicantAgreed, setApplicantAgreed] = useState(false);

  // حقول تأكيد التوظيف (للجهة)
  const [hireSelectedApplicant, setHireSelectedApplicant] = useState('');
  const [hireStartDate, setHireStartDate] = useState('');
  const [hireAgreedSalary, setHireAgreedSalary] = useState('');

  // تقديم وظيفة جديدة
  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postCompany || !postPhone) return;

    // فحص موافقة العمولة إذا كانت مفعلة على الجهة
    if (CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'employer_only' || CURRENT_COMMISSION_POLICY.payer === 'both')) {
      if (!employerAgreed) {
        alert('يرجى الموافقة على شروط عمولة التوظيف لإتمام نشر الوظيفة.');
        return;
      }
    }

    const newJob: JobVacancy = {
      id: `job_${Date.now()}`,
      title: postTitle,
      companyName: postCompany,
      contactPerson: postContactPerson,
      phone: postPhone,
      locationDetails: `${postCity} - مسجل بالنظام`,
      city: postCity,
      sector: postSector as any,
      workType: postWorkType as any,
      experienceLevel: 'متوسط (2-4 سنوات)',
      salaryRange: postSalary.trim() ? postSalary.trim() : 'يحدد بعد المقابلة',
      postedDate: 'الآن',
      deadline: 'خلال شهر',
      description: postDesc,
      requirements: postRequirements.split('\n').filter(r => r.trim().length > 0),
      status: 'active',
      employerAgreedCommission: employerAgreed,
      applicantsCount: 0
    };

    setJobs(prev => [newJob, ...prev]);
    setIsPostJobModalOpen(false);
    setSuccessToast('تم استلام الوظيفة بنجاح وإدراجها في نظام التطابق الذكي.');
    setTimeout(() => setSuccessToast(null), 4000);

    // تفريغ الحقول
    setPostTitle('');
    setPostCompany('');
    setPostPhone('');
    setPostDesc('');
    setPostRequirements('');
    setEmployerAgreed(false);
  };

  // تقديم المتقدم
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyFullName || !applyPhone) return;

    // فحص موافقة العمولة إذا كانت مفعلة على المتقدم
    if (CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'applicant_only' || CURRENT_COMMISSION_POLICY.payer === 'both')) {
      if (!applicantAgreed) {
        alert('يرجى الموافقة على شروط عمولة التوظيف لإتمام التقديم.');
        return;
      }
    }

    setIsApplyModalOpen(false);
    setSuccessToast('تم تسجيل ملفك بنجاح! عند حدوث تطابق مع الوظيفة ستصلك رسالة رسمية ببيانات الجهة ورقم الطلب YR.');
    setTimeout(() => setSuccessToast(null), 5000);

    // تفريغ الحقول
    setApplyFullName('');
    setApplyPhone('');
    setApplySummary('');
    setApplicantAgreed(false);
  };

  // تأكيد التوظيف وإغلاق الإعلان
  const handleConfirmHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobDetails || !hireStartDate) return;

    // تغيير حالة الوظيفة إلى تم التوظيف وإزالتها من العرض النشط
    setJobs(prev =>
      prev.map(j => (j.id === selectedJobDetails.id ? { ...j, status: 'hired' } : j))
    );

    setIsHireConfirmModalOpen(false);
    setSelectedJobDetails(null);
    setSuccessToast('تم تأكيد التوظيف بنجاح! تم إغلاق الإعلان وحفظ سجل مباشرة العمل والعمولة للإدارة.');
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // تصفية الوظائف النشطة فقط للعرض العام
  const filteredJobs = jobs.filter(j => {
    if (j.status !== 'active') return false;
    const matchSearch = j.title.includes(searchQuery) || j.sector.includes(searchQuery);
    const matchCity = selectedCity === 'all' || j.city.includes(selectedCity);
    const matchSector = selectedSector === 'all' || j.sector === selectedSector;
    return matchSearch && matchCity && matchSector;
  });

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans pb-10">
      {/* 1. رأس صفحة الوظائف */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-yellow-500">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <h1 className="text-xl sm:text-2xl font-black text-white">سوق التوظيف والوظائف المعتمدة</h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              فرص عمل موثوقة ونظام تطابق ذكي يربط الكفاءات بالشركات بدون رسوم تقديم
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs sm:text-sm border border-zinc-700 transition"
            >
              تسجيل ملف باحث عن عمل
            </button>
            <button
              onClick={() => setIsPostJobModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-yellow-500/10"
            >
              <Plus className="w-4 h-4" /> أضف وظيفة شاغرة
            </button>
          </div>
        </div>
      </div>

      {/* إشعار النجاح */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. شريط البحث والفلاتر */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث بالمسمى الوظيفي أو التخصص..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
        >
          <option value="all">كل المحافظات</option>
          <option value="صنعاء">صنعاء</option>
          <option value="عدن">عدن</option>
          <option value="تعز">تعز</option>
          <option value="المكلا">حضرموت - المكلا</option>
          <option value="الحديدة">الحديدة</option>
          <option value="مأرب">مأرب</option>
        </select>

        <select
          value={selectedSector}
          onChange={e => setSelectedSector(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
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

      {/* 3. قائمة الوظائف (بدون إظهار بيانات الاتصال المباشرة) */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
            لا توجد شواغر وظيفية مطابقة للبحث حالياً.
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {job.sector}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {job.workType}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-400">
                      {job.experienceLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white">{job.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" /> {job.companyName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {job.city}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-zinc-300">
                      <DollarSign className="w-3.5 h-3.5 text-yellow-500" /> الراتب: {job.salaryRange || 'يحدد بعد المقابلة'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => setSelectedJobDetails(job)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold rounded-xl text-xs border border-zinc-800 transition"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJobDetails(job);
                      setIsApplyModalOpen(true);
                    }}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition"
                  >
                    قدّم الآن
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* نافذة تفاصيل الوظيفة وخيار "تم التوظيف" للجهة              */}
      {/* ========================================================= */}
      {selectedJobDetails && !isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedJobDetails.title}</h3>
                <span className="text-xs text-zinc-400">{selectedJobDetails.companyName} • {selectedJobDetails.city}</span>
              </div>
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* تنبيه الخصوصية */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
              <Lock className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>بيانات التواصل المباشرة للجهة والباحثين محمية ويتم تبادلها تلقائياً عند حدوث تطابق رسمي.</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-zinc-300 block mb-1">وصف الشاغر:</span>
                <p className="text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 leading-relaxed">
                  {selectedJobDetails.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-zinc-300 block mb-1">المتطلبات والشروط:</span>
                <ul className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-1 text-zinc-300 list-disc list-inside">
                  {selectedJobDetails.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800">
                <span>المخصص المالي: <strong className="text-yellow-400 font-mono">{selectedJobDetails.salaryRange || 'يحدد بعد المقابلة'}</strong></span>
                <span>نوع الدوام: <strong className="text-zinc-200">{selectedJobDetails.workType}</strong></span>
              </div>
            </div>

            {/* الإجراءات: تقديم + زر "✓ تم التوظيف" الخاص بالجهة */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition"
                >
                  قدّم بياناتك لهذا الشاغر
                </button>

                {/* زر تأكيد التوظيف للجهة */}
                <button
                  onClick={() => setIsHireConfirmModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                  title="الجهة تؤكد توظيف المرشح وإغلاق الإعلان"
                >
                  <Check className="w-4 h-4" /> ✓ تم التوظيف
                </button>
              </div>

              <button
                onClick={() => setSelectedJobDetails(null)}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة إنشاء وظيفة شاغرة للجهة (مع صندوق العمولة بعد الحقول) */}
      {/* ========================================================= */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-500">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">إضافة وظيفة شاغرة جديدة</h3>
              </div>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">المسمى الوظيفي: *</label>
                <input
                  type="text"
                  placeholder="مثال: محاسب قانوني، مطور برمجيات..."
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">اسم الجهة / الشركة: *</label>
                  <input
                    type="text"
                    placeholder="اسم المنشأة الحقيقي..."
                    value={postCompany}
                    onChange={e => setPostCompany(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">هاتف مسؤول التواصل: *</label>
                  <input
                    type="text"
                    placeholder="رقم الهاتف (سري ومحمي)..."
                    value={postPhone}
                    onChange={e => setPostPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المحافظة / المدينة: *</label>
                  <select
                    value={postCity}
                    onChange={e => setPostCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
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
                  <label className="block font-bold text-zinc-300 mb-1">قطاع التخصص: *</label>
                  <select
                    value={postSector}
                    onChange={e => setPostSector(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
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
                <label className="block font-bold text-zinc-300 mb-1">
                  الراتب الشهري (اختياري - يترك فارغاً إذا كان يحدد بعد المقابلة):
                </label>
                <input
                  type="text"
                  placeholder="مثال: $800 أو 300,000 ريال (أو اتركه فارغاً)"
                  value={postSalary}
                  onChange={e => setPostSalary(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">الوصف والشروط المطلوبة: *</label>
                <textarea
                  placeholder="اكتب المهام والشروط وسنوات الخبرة المطلوبة..."
                  value={postDesc}
                  onChange={e => setPostDesc(e.target.value)}
                  className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              {/* ⚠️ يظهر صندوق الموافقة للجهة بعد كتابة الحقول إذا كانت العمولة مفعلة */}
              {CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'employer_only' || CURRENT_COMMISSION_POLICY.payer === 'both') && (
                <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-2 mt-3">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-400">
                    <ShieldCheck className="w-4 h-4" />
                    شروط عمولة التوظيف لمنصة Yemen Rating:
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    عمولة يمن ريتغ عند نجاح التوظيف: <strong>{CURRENT_COMMISSION_POLICY.percentageValue}% من راتب الشهر الأول</strong>. 
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
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl transition"
                >
                  نشر الوظيفة في النظام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة تقديم المتقدم (مع صندوق العمولة بعد الحقول)           */}
      {/* ========================================================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-500">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">تسجيل بيانات التقديم والتطابق</h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">الاسم الكامل: *</label>
                <input
                  type="text"
                  placeholder="الاسم الثلاثي أو الرباعي..."
                  value={applyFullName}
                  onChange={e => setApplyFullName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">رقم الهاتف: *</label>
                  <input
                    type="text"
                    placeholder="رقم الهاتف للاتصال..."
                    value={applyPhone}
                    onChange={e => setApplyPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المدينة / الإقامة: *</label>
                  <select
                    value={applyCity}
                    onChange={e => setApplyCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">المؤهل والتخصص: *</label>
                  <input
                    type="text"
                    placeholder="مثال: بكالوريوس محاسبة..."
                    value={applyQualification}
                    onChange={e => setApplyQualification(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">سنوات الخبرة: *</label>
                  <input
                    type="text"
                    placeholder="مثال: 3 سنوات..."
                    value={applyExperience}
                    onChange={e => setApplyExperience(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">المهارات والخبرات السابقة: *</label>
                <textarea
                  placeholder="اكتب أبرز مهاراتك والأنظمة التي تتقنها..."
                  value={applySummary}
                  onChange={e => setApplySummary(e.target.value)}
                  className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              {/* ⚠️ يظهر صندوق الموافقة للمتقدم بعد كتابة الحقول إذا كانت العمولة مفعلة عليه */}
              {CURRENT_COMMISSION_POLICY.isEnabled && (CURRENT_COMMISSION_POLICY.payer === 'applicant_only' || CURRENT_COMMISSION_POLICY.payer === 'both') && (
                <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-2 mt-3">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-400">
                    <ShieldCheck className="w-4 h-4" />
                    شروط عمولة التوظيف للمتقدم:
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    عمولة يمن ريتغ عند نجاح التوظيف: <strong>{CURRENT_COMMISSION_POLICY.percentageValue}% من راتب الشهر الأول</strong>. 
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
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl transition"
                >
                  إرسال الملف لنظام التطابق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة تأكيد التوظيف (الجهة تضغط تم التوظيف)                */}
      {/* ========================================================= */}
      {isHireConfirmModalOpen && selectedJobDetails && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">تأكيد توظيف المتقدم وإغلاق الإعلان</h3>
              </div>
              <button
                onClick={() => setIsHireConfirmModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmHireSubmit} className="space-y-3 text-xs">
              <p className="text-zinc-300">
                الوظيفة: <strong className="text-white">{selectedJobDetails.title}</strong>
              </p>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">اسم الموظف الذي تم قبوله: *</label>
                <input
                  type="text"
                  placeholder="اسم المتقدم المرشح..."
                  value={hireSelectedApplicant}
                  onChange={e => setHireSelectedApplicant(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">تاريخ مباشرة العمل الفعلي: *</label>
                <input
                  type="date"
                  value={hireStartDate}
                  onChange={e => setHireStartDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-0.5 block">يبدأ حساب الشهر الأول من هذا التاريخ.</span>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">الراتب الشهري المتفق عليه: *</label>
                <input
                  type="text"
                  placeholder="مثال: $1,200 USD أو 400,000 ريال..."
                  value={hireAgreedSalary}
                  onChange={e => setHireAgreedSalary(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHireConfirmModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                >
                  تأكيد التوظيف وإغلاق الشاغر
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
