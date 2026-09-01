import React, { useState, useMemo, useRef } from 'react';
import { 
  Briefcase, MapPin, ArrowRight, Plus, CheckCircle2, 
  User, X, Upload, Trash2, ShieldCheck, 
  FileText, Check, Search, AlertCircle
} from 'lucide-react';
import { AdBanner } from '../common/AdBanner';

export interface JobItem {
  id: string;
  title: string;
  category: string;
  jobType: 'دوام كامل' | 'دوام جزئي' | 'عن بعد' | 'عقد';
  experience: 'مبتدئ' | '1-3 سنوات' | '3-5 سنوات' | '5+ سنوات';
  gender: 'ذكر' | 'أنثى' | 'لا يشترط';
  education: 'ثانوية' | 'دبلوم' | 'بكالوريوس' | 'ماجستير' | 'خبرة مهنية';
  salary: number;
  currency: string;
  city: string;
  description: string;
  requirements: string[];
  employerName: string;
  employerPhone: string;
  employerEmail: string;
  applicantsCount: number;
  status: 'active' | 'closed';
  createdAt: string;
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 'job-101',
    title: 'مهندس برمجيات وتطبيقات React & Node.js',
    category: 'تكنولوجيا ومعلومات',
    jobType: 'دوام كامل',
    experience: '3-5 سنوات',
    gender: 'لا يشترط',
    education: 'بكالوريوس',
    salary: 650000,
    currency: 'YER',
    city: 'صنعاء — حدة',
    description: 'مطلوب مهندس برمجيات ذو كفاءة عالية لتطوير وصيانة منصات الويب وقواعد البيانات والربط مع الـ API.',
    requirements: [
      'خبرة لا تقل عن 3 سنوات في React و TypeScript',
      'معرفة ممتازة بقواعد بيانات PostgreSQL أو MySQL',
      'القدرة على العمل بروح الفريق وإنجاز المهام في وقتها'
    ],
    employerName: 'شركة برمجيات رائدة',
    employerPhone: '967777123456',
    employerEmail: 'hr@tech-ye.com',
    applicantsCount: 12,
    status: 'active',
    createdAt: 'اليوم'
  },
  {
    id: 'job-102',
    title: 'مدير تسويق رقمي وحملات إعلانية',
    category: 'تسويق ومبيعات',
    jobType: 'دوام كامل',
    experience: '3-5 سنوات',
    gender: 'لا يشترط',
    education: 'بكالوريوس',
    salary: 480000,
    currency: 'YER',
    city: 'عدن — المعلا',
    description: 'إدارة وتوجيه الحملات الترويجية الممولة، كتابة المحتوى التسويقي، وإدارة منصات التواصل الاجتماعي.',
    requirements: [
      'خبرة عملية في إدارة الحملات على Google Ads و Meta',
      'مهارة عالية في تحليل العوائد ومعدلات التحويل CTR',
      'إجادة إعداد الخطط التسويقية الشهرية والسنوية'
    ],
    employerName: 'مجموعة تجارية وصناعية',
    employerPhone: '967733987654',
    employerEmail: 'jobs@aden-group.com',
    applicantsCount: 19,
    status: 'active',
    createdAt: 'أمس'
  },
  {
    id: 'job-103',
    title: 'محاسب مالي وقانوني معتمد',
    category: 'مالية ومحاسبة',
    jobType: 'دوام كامل',
    experience: '1-3 سنوات',
    gender: 'لا يشترط',
    education: 'بكالوريوس',
    salary: 430000,
    currency: 'YER',
    city: 'حضرموت — المكلا',
    description: 'إعداد التقارير المالية الدورية، مراجعة القيود المحاسبية، ومتابعة الحسابات المدينة والدائنة والضرائب.',
    requirements: [
      'بكالوريوس محاسبة بتقدير جيد جداً كحد أدنى',
      'إجادة العمل على الأنظمة المحاسبية المعتمدة (يمن سوفت/أونكس)',
      'الدقة العالية في إعداد القوائم والميزانيات'
    ],
    employerName: 'مؤسسة مالية معتمدة',
    employerPhone: '967711223344',
    employerEmail: 'finance@mukalla.com',
    applicantsCount: 8,
    status: 'active',
    createdAt: 'منذ يومين'
  },
  {
    id: 'job-104',
    title: 'فني صيانة جوالات وأجهزة ذكية',
    category: 'صيانة وتقنية',
    jobType: 'دوام كامل',
    experience: '1-3 سنوات',
    gender: 'ذكر',
    education: 'خبرة مهنية',
    salary: 380000,
    currency: 'YER',
    city: 'تعز — الحوبان',
    description: 'صيانة وبرمجة كافة أنواع الهواتف الذكية (هاردوير وسوفت وير) وتبديل الشاشات والبطاريات بدقة عالية.',
    requirements: [
      'خبرة عملية مثبتة في صيانة أجهزة Apple و Samsung',
      'مهارة في لحام المكونات الدقيقة وفحص الدوائر الإلكترونية',
      'حسن التعامل مع العملاء والأمانة المهنية'
    ],
    employerName: 'مركز صيانة معتمد',
    employerPhone: '967770554433',
    employerEmail: 'tech@taizphone.com',
    applicantsCount: 15,
    status: 'active',
    createdAt: 'منذ 3 أيام'
  }
];

export const JobsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [jobsList, setJobsList] = useState<JobItem[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // نافذة نشر وظيفة (صاحب العمل)
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [postEmployerName, setPostEmployerName] = useState('');
  const [postEmployerPhone, setPostEmployerPhone] = useState('');
  const [postEmployerEmail, setPostEmployerEmail] = useState('');
  const [postJobTitle, setPostJobTitle] = useState('');
  const [postCategory, setPostCategory] = useState('تكنولوجيا ومعلومات');
  const [postJobType, setPostJobType] = useState<JobItem['jobType']>('دوام كامل');
  const [postExperience, setPostExperience] = useState<JobItem['experience']>('1-3 سنوات');
  const [postGender, setPostGender] = useState<JobItem['gender']>('لا يشترط');
  const [postEducation, setPostEducation] = useState<JobItem['education']>('بكالوريوس');
  const [postSalary, setPostSalary] = useState<number>(400000);
  const [postCity, setPostCity] = useState('صنعاء');
  const [postDescription, setPostDescription] = useState('');
  const [postRequirements, setPostRequirements] = useState('');
  const [agreedToEmployerPolicy, setAgreedToEmployerPolicy] = useState(false);

  // نافذة التقديم (الباحث عن عمل)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantCity, setApplicantCity] = useState('صنعاء');
  const [applicantExperience, setApplicantExperience] = useState('سنتان');
  const [applicantGender, setApplicantGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [applicantQualification, setApplicantQualification] = useState('بكالوريوس');
  const [applicantSummary, setApplicantSummary] = useState('');
  const [cvFileName, setCvFileName] = useState<string>('');
  const [agreedToApplicantPolicy, setAgreedToApplicantPolicy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenJob = (job: JobItem) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFileName(file.name);
    }
  };

  const isValidYemenPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length >= 9;
  };

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidYemenPhone(postEmployerPhone)) {
      setToastMessage('يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (!agreedToEmployerPolicy) return;

    const reqArray = postRequirements.split('\n').filter(r => r.trim().length > 0);

    const newEntry: JobItem = {
      id: `job-${Date.now()}`,
      title: postJobTitle,
      category: postCategory,
      jobType: postJobType,
      experience: postExperience,
      gender: postGender,
      education: postEducation,
      salary: Number(postSalary),
      currency: 'YER',
      city: postCity,
      description: postDescription || 'فرصة عمل معتمدة عبر وساطة يمن ريتنغ.',
      requirements: reqArray.length > 0 ? reqArray : ['الالتزام والجدية في العمل'],
      employerName: postEmployerName || 'جهة عمل معتمدة',
      employerPhone: postEmployerPhone,
      employerEmail: postEmployerEmail,
      applicantsCount: 0,
      status: 'active',
      createdAt: 'الآن'
    };

    setJobsList(prev => [newEntry, ...prev]);
    setIsPostJobModalOpen(false);
    setPostJobTitle('');
    setPostEmployerName('');
    setPostEmployerPhone('');
    setPostEmployerEmail('');
    setPostDescription('');
    setPostRequirements('');
    setAgreedToEmployerPolicy(false);
    setToastMessage('تم إرسال طلب التوظيف بنجاح وستوفر لك يمن ريتنغ الكوادر المناسبة');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidYemenPhone(applicantPhone)) {
      setToastMessage('يرجى إدخال رقم هاتف للتواصل مكون من 9 أرقام');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (!agreedToApplicantPolicy || !selectedJob) return;

    setJobsList(prev => prev.map(j => j.id === selectedJob.id ? { ...j, applicantsCount: j.applicantsCount + 1 } : j));
    setSelectedJob(prev => prev ? { ...prev, applicantsCount: prev.applicantsCount + 1 } : null);

    setIsApplyModalOpen(false);
    setApplicantName('');
    setApplicantPhone('');
    setApplicantEmail('');
    setApplicantSummary('');
    setCvFileName('');
    setAgreedToApplicantPolicy(false);
    setToastMessage('تم استلام طلبك وسيرتك الذاتية بنجاح، وسيتم إشعارك عند القبول');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredJobs = useMemo(() => {
    return jobsList.filter(job => {
      const matchCity = selectedCity === 'all' || job.city.includes(selectedCity);
      const matchType = selectedJobType === 'all' || job.jobType === selectedJobType;
      const matchExp = selectedExperience === 'all' || job.experience === selectedExperience;
      const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchType && matchExp && matchSearch;
    });
  }, [jobsList, selectedCity, selectedJobType, selectedExperience, searchQuery]);

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص للوظائف #7 */}
      <AdBanner placementId="7" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Briefcase size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              الوظائف
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              فرص عمل معتمدة ووساطة توظيف ذكية في اليمن
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>نشر وظيفة</span>
          </button>
          
          <button
            onClick={selectedJob ? () => setSelectedJob(null) : onBack}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{selectedJob ? 'رجوع' : 'الرئيسية'}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          عرض تفاصيل الوظيفة والتقديم الآمن
          ============================================================ */}
      {selectedJob ? (
        <div className="space-y-3">
          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-4 sm:p-5 space-y-4 shadow-xl">
            
            {/* رأس الوظيفة */}
            <div className="border-b border-[#1F2937] pb-3 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#16A34A]/20 text-[#16A34A] text-[10px] font-black">
                    {selectedJob.jobType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">
                    {selectedJob.category}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">نشرت: {selectedJob.createdAt}</span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {selectedJob.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-gray-300 font-mono flex-wrap">
                <span className="flex items-center gap-1 text-[#FFC500]">
                  <MapPin size={13} /> {selectedJob.city}
                </span>
                <span>•</span>
                <span>الراتب: <b className="text-white">{selectedJob.salary.toLocaleString()} {selectedJob.currency}</b></span>
                <span>•</span>
                <span>المتقدمون: <b className="text-gray-200">{selectedJob.applicantsCount}</b></span>
              </div>
            </div>

            {/* شبكة المواصفات */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">الخبرة المطلوبة</span>
                <b className="text-xs text-white font-bold font-['Cairo']">{selectedJob.experience}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">المؤهل العلمي</span>
                <b className="text-xs text-white font-bold font-['Cairo']">{selectedJob.education}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">الجنس</span>
                <b className="text-xs text-white font-bold font-['Cairo']">{selectedJob.gender}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">وساطة التوظيف</span>
                <b className="text-xs text-[#16A34A] font-bold font-['Cairo']">يمن ريتنغ ✓</b>
              </div>
            </div>

            {/* الوصف والمتطلبات */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white">الوصف الوظيفي:</h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed font-medium">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-white">الشروط والمهارات المطلوبة:</h3>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check size={13} className="text-[#FFC500] shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* زر فتح نافذة التقديم */}
            <div className="pt-2">
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full py-3 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <FileText size={15} />
                <span>التقديم على الوظيفة الآن</span>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة الوظائف
           ============================================================ */
        <div className="space-y-3">
          
          {/* شريط البحث والفلترة */}
          <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
            <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
              <Search size={14} className="text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مسمى وظيفي (مهندس، محاسب، تسويق)..."
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#18181C] border border-[#27272A] rounded-lg p-1.5 text-[10.5px] font-bold text-[#D1D5DB] outline-none cursor-pointer"
              >
                <option value="all">كل المحافظات</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="حضرموت">حضرموت</option>
                <option value="الحديدة">الحديدة</option>
              </select>

              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="bg-[#18181C] border border-[#27272A] rounded-lg p-1.5 text-[10.5px] font-bold text-[#D1D5DB] outline-none cursor-pointer"
              >
                <option value="all">نوع الدوام</option>
                <option value="دوام كامل">دوام كامل</option>
                <option value="دوام جزئي">دوام جزئي</option>
                <option value="عن بعد">عن بعد</option>
              </select>

              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="bg-[#18181C] border border-[#27272A] rounded-lg p-1.5 text-[10.5px] font-bold text-[#D1D5DB] outline-none cursor-pointer"
              >
                <option value="all">الخبرة</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="1-3 سنوات">1-3 سنوات</option>
                <option value="3-5 سنوات">3-5 سنوات</option>
                <option value="5+ سنوات">5+ سنوات</option>
              </select>
            </div>
          </div>

          {/* شبكة كروت الوظائف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 p-3 space-y-2 shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.2 rounded bg-[#16A34A]/15 text-[#16A34A] text-[9.5px] font-bold">
                      {job.jobType}
                    </span>
                    <span className="text-[9.5px] text-gray-400 flex items-center gap-0.5">
                      <MapPin size={10} className="text-[#FFC500]" /> {job.city}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {job.title}
                  </h3>

                  <p className="text-[10px] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1F2937] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-400 font-['Cairo']">الراتب:</span>
                    <b className="text-xs text-[#FFC500]">{job.salary.toLocaleString()} {job.currency}</b>
                  </div>

                  <button
                    onClick={() => handleOpenJob(job)}
                    className="w-full py-1.5 rounded-xl bg-[#18181C] border border-[#27272A] hover:bg-[#FFC500] hover:text-black text-xs font-bold text-gray-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>عرض التفاصيل والتقديم</span>
                    <ArrowRight size={11} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================
          نافذة نشر وظيفة جديدة (صاحب العمل) — مع الشرط الإلزامي بخلفية خضراء شفافة
          ============================================================ */}
      {isPostJobModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsPostJobModalOpen(false)}
        >
          <div 
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto cursor-default shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={15} className="text-[#FFC500]" /> نشر وظيفة جديدة
              </h3>
              <button 
                onClick={() => setIsPostJobModalOpen(false)} 
                className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
              >
                رجوع
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">اسم المنشأة / صاحب العمل</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الشركة أو الجهة..."
                    value={postEmployerName}
                    onChange={(e) => setPostEmployerName(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">رقم الهاتف (9 أرقام إجباري)</label>
                  <input
                    type="tel"
                    required
                    placeholder="777000111"
                    value={postEmployerPhone}
                    onChange={(e) => setPostEmployerPhone(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">المسمى الوظيفي المطلوب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محاسب عام، مهندس شبكات..."
                  value={postJobTitle}
                  onChange={(e) => setPostJobTitle(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">نوع الدوام</label>
                  <select
                    value={postJobType}
                    onChange={(e) => setPostJobType(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="دوام كامل">دوام كامل</option>
                    <option value="دوام جزئي">دوام جزئي</option>
                    <option value="عن بعد">عن بعد</option>
                    <option value="عقد">عقد عمل مؤقت</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الخبرة المطلوبة</label>
                  <select
                    value={postExperience}
                    onChange={(e) => setPostExperience(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="مبتدئ">مبتدئ / حديث تخرج</option>
                    <option value="1-3 سنوات">1-3 سنوات</option>
                    <option value="3-5 سنوات">3-5 سنوات</option>
                    <option value="5+ سنوات">5+ سنوات خبرة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الجنس</label>
                  <select
                    value={postGender}
                    onChange={(e) => setPostGender(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="لا يشترط">لا يشترط</option>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">المؤهل</label>
                  <select
                    value={postEducation}
                    onChange={(e) => setPostEducation(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="بكالوريوس">بكالوريوس</option>
                    <option value="دبلوم">دبلوم</option>
                    <option value="ثانوية">ثانوية</option>
                    <option value="خبرة مهنية">خبرة مهنية</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">المحافظة</label>
                  <select
                    value={postCity}
                    onChange={(e) => setPostCity(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="مأرب">مأرب</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">الراتب التقديري (بالريال اليمني ﷼)</label>
                <input
                  type="number"
                  required
                  value={postSalary}
                  onChange={(e) => setPostSalary(Number(e.target.value))}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">وصف الوظيفة والمهام</label>
                <textarea
                  rows={2}
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="اكتب المهام والمسؤوليات المطلوبة..."
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">الشروط (سطر لكل شرط)</label>
                <textarea
                  rows={2}
                  value={postRequirements}
                  onChange={(e) => setPostRequirements(e.target.value)}
                  placeholder="اكتب كل شرط في سطر مستقل..."
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              {/* شرط مقدم التوظيف الإلزامي بالخلفية الخضراء الشفافة */}
              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>تنبيه إلزامي:</span>
                </div>
                <p className="text-[11px] text-gray-200 leading-relaxed">
                  توفر منصة يمن ريتغ خدمة الوساطة والتوظيف للوصول إلى المتقدمين المناسبين، ويتم إشعار صاحب العمل عند قبول المتقدم وبدء عمله. وبتقديم طلب التوظيف، يقرّ صاحب العمل بموافقته على شروط الوساطة، ويلتزم بإبلاغ الموظف وإلزامه بسداد عمولة الوساطة المستحقة للمنصة والبالغة (20,000 ريال يمني) من راتب الشهر الأول، عند إتمام التوظيف وبدء العمل.
                </p>

                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToEmployerPolicy}
                    onChange={(e) => setAgreedToEmployerPolicy(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-white">
                    أوافق على شروط الوساطة وإلزام سداد عمولة المنصة (20,000 ريال يمني)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToEmployerPolicy}
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md"
                >
                  إرسال الوظيفة للاعتماد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          نافذة التقديم على الوظيفة (الباحث عن عمل) — مع الشرط الإلزامي بالخلفية الخضراء الشفافة
          ============================================================ */}
      {isApplyModalOpen && selectedJob && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsApplyModalOpen(false)}
        >
          <div 
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto cursor-default shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText size={15} className="text-[#FFC500]" /> التقديم على الوظيفة
                </h3>
                <span className="text-[10px] text-[#9CA3AF]">{selectedJob.title}</span>
              </div>
              <button 
                onClick={() => setIsApplyModalOpen(false)} 
                className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
              >
                رجوع
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="اسمك الثلاثي..."
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">رقم الهاتف (9 أرقام للتواصل)</label>
                  <input
                    type="tel"
                    required
                    placeholder="777000111"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">المحافظة</label>
                  <select
                    value={applicantCity}
                    onChange={(e) => setApplicantCity(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">المؤهل</label>
                  <select
                    value={applicantQualification}
                    onChange={(e) => setApplicantQualification(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="بكالوريوس">بكالوريوس</option>
                    <option value="دبلوم">دبلوم</option>
                    <option value="ثانوية">ثانوية</option>
                    <option value="خبرة مهنية">خبرة مهنية</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الجنس</label>
                  <select
                    value={applicantGender}
                    onChange={(e) => setApplicantGender(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">سنوات الخبرة والمسمى الحالي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خبرة 3 سنوات في المحاسبة..."
                  value={applicantExperience}
                  onChange={(e) => setApplicantExperience(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              {/* رفع السيرة الذاتية PDF أو صورة */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">السيرة الذاتية (ملف PDF أو صورة الشهادات)</label>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleCvUpload} 
                  className="hidden" 
                />
                
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#18181C] border border-dashed border-[#FFC500]/60 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#FFC500]"
                  >
                    <Upload size={14} className="text-[#FFC500]" />
                    <span>{cvFileName ? `الملف: ${cvFileName}` : 'رفع السيرة الذاتية (PDF/صورة)'}</span>
                  </button>

                  {cvFileName && (
                    <button
                      type="button"
                      onClick={() => setCvFileName('')}
                      className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-gray-500 block mt-1">
                  * ملفاتك وسيرتك الذاتية سرية ومحمية 100% ولا تظهر للعامة.
                </span>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">نبذة عن خبراتك ومؤهلاتك</label>
                <textarea
                  rows={2}
                  value={applicantSummary}
                  onChange={(e) => setApplicantSummary(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن أبرز مهاراتك وخبراتك..."
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              {/* شرط المتقدم للوظيفة الإلزامي بالخلفية الخضراء الشفافة */}
              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>تنبيه إلزامي :</span>
                </div>
                <p className="text-[11px] text-gray-200 leading-relaxed">
                  توفر لك منصة يمن ريتغ خدمة الوساطة والتوظيف، ويتم إشعارك عند حصولك على الوظيفة. بتقديم الطلب، يقرّ المتقدم بموافقته على شروط الوساطة ويلتزم بسداد عمولة الوساطة البالغة (20,000 ريال يمني) من راتب الشهر الأول عند استلام الوظيفة.
                </p>

                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToApplicantPolicy}
                    onChange={(e) => setAgreedToApplicantPolicy(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-white">
                    أوافق على شروط الوساطة والالتزام بسداد العمولة (20,000 ريال يمني)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToApplicantPolicy}
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md"
                >
                  إرسال طلب التقديم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
