import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Users, Cpu, FileText, CheckCircle2, 
  Clock, Sparkles, Phone, MapPin, TrendingUp, 
  Check, X, Search, Filter, CreditCard, AlertTriangle, 
  Eye, Download, Building2, User, Award, ShieldCheck
} from 'lucide-react';
import { calculateYRMatch } from '../../../utils/matchingEngine';
import { adminAuditService } from '../../../services/adminService';

interface AdminJobPosting {
  id: string;
  title: string;
  category: string;
  jobType: 'دوام كامل' | 'دوام جزئي' | 'عن بعد' | 'عقد';
  experience: string;
  gender: string;
  education: string;
  salary: number;
  currency: string;
  city: string;
  description: string;
  requiredSkills: string[];
  employerName: string;
  employerPhone: string;
  employerEmail: string;
  status: 'active' | 'pending_approval' | 'closed';
  commissionAmount: number;
  commissionStatus: 'not_due' | 'due' | 'pending_verification' | 'paid';
  applicantsCount: number;
  createdAt: string;
}

interface AdminJobApplicant {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  experienceYears: number;
  gender: 'ذكر' | 'أنثى';
  education: string;
  skills: string[];
  summary: string;
  cvFileName: string;
  status: 'new' | 'under_review' | 'interview_scheduled' | 'hired' | 'rejected';
  appliedAt: string;
}

const INITIAL_ADMIN_JOBS: AdminJobPosting[] = [
  {
    id: 'JOB-101',
    title: 'مهندس برمجيات وتطبيقات React & Node.js',
    category: 'تكنولوجيا ومعلومات',
    jobType: 'دوام كامل',
    experience: '3-5 سنوات',
    gender: 'لا يشترط',
    education: 'بكالوريوس',
    salary: 650000,
    currency: 'YER',
    city: 'صنعاء',
    description: 'تطوير وتصميم منصات الويب وقواعد البيانات والربط مع الـ API.',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    employerName: 'شركة يمن سوفت للحلول',
    employerPhone: '777123456',
    employerEmail: 'hr@yemensoft.com',
    status: 'active',
    commissionAmount: 20000,
    commissionStatus: 'pending_verification',
    applicantsCount: 12,
    createdAt: '2026-08-30'
  },
  {
    id: 'JOB-102',
    title: 'مدير تسويق رقمي وحملات إعلانية',
    category: 'تسويق ومبيعات',
    jobType: 'دوام كامل',
    experience: '3-5 سنوات',
    gender: 'لا يشترط',
    education: 'بكالوريوس',
    salary: 480000,
    currency: 'YER',
    city: 'عدن',
    description: 'إدارة وتوجيه الحملات الترويجية الممولة وتحليل معدلات التحويل.',
    requiredSkills: ['Google Ads', 'Meta Ads', 'SEO', 'إدارة محتوى', 'تحليل بيانات'],
    employerName: 'مجموعة هائل سعيد أنعم',
    employerPhone: '733987654',
    employerEmail: 'careers@hsa-group.com',
    status: 'active',
    commissionAmount: 20000,
    commissionStatus: 'not_due',
    applicantsCount: 19,
    createdAt: '2026-08-31'
  },
  {
    id: 'JOB-103',
    title: 'محاسب مالي وقانوني معتمد',
    category: 'مالية ومحاسبة',
    jobType: 'دوام كامل',
    experience: '1-3 سنوات',
    gender: 'لا يشترط',
    education: 'بكالوريوس',
    salary: 430000,
    currency: 'YER',
    city: 'حضرموت - المكلا',
    description: 'إعداد القوائم والتقارير المالية الدورية ومتابعة الضرائب.',
    requiredSkills: ['يمن سوفت', 'أونكس برو', 'إكسل مالي', 'إعداد الميزانيات'],
    employerName: 'بنك الكريمي للتمويل',
    employerPhone: '711223344',
    employerEmail: 'jobs@kuraimibank.com',
    status: 'closed',
    commissionAmount: 20000,
    commissionStatus: 'paid',
    applicantsCount: 8,
    createdAt: '2026-08-25'
  }
];

const INITIAL_APPLICANTS: AdminJobApplicant[] = [
  {
    id: 'APP-501',
    jobId: 'JOB-101',
    jobTitle: 'مهندس برمجيات وتطبيقات React & Node.js',
    name: 'م. حسام العريقي',
    phone: '777001122',
    email: 'hussam@developer.ye',
    city: 'صنعاء',
    experienceYears: 4,
    gender: 'ذكر',
    education: 'بكالوريوس تقنية معلومات',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    summary: 'مطور برمجيات بخبرة 4 سنوات في بناء تطبيقات الويب المتكاملة وأنظمة الدفع.',
    cvFileName: 'CV_Hussam_Areqi_2026.pdf',
    status: 'interview_scheduled',
    appliedAt: '2026-09-01 06:30'
  },
  {
    id: 'APP-502',
    jobId: 'JOB-101',
    jobTitle: 'مهندس برمجيات وتطبيقات React & Node.js',
    name: 'أحمد باحاج',
    phone: '733445566',
    email: 'ahmed@tech.ye',
    city: 'عدن',
    experienceYears: 2,
    gender: 'ذكر',
    education: 'دبلوم برمجيات',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'MySQL'],
    summary: 'مطور واجهات أمامية، إنجاز أكثر من 10 مشاريع تجارية.',
    cvFileName: 'Ahmed_Resume.pdf',
    status: 'under_review',
    appliedAt: '2026-09-01 07:15'
  },
  {
    id: 'APP-503',
    jobId: 'JOB-102',
    jobTitle: 'مدير تسويق رقمي وحملات إعلانية',
    name: 'فاطمة العولقي',
    phone: '711889900',
    email: 'fatima@marketing.ye',
    city: 'عدن',
    experienceYears: 4,
    gender: 'أنثى',
    education: 'بكالوريوس إدارة أعمال وتسويق',
    skills: ['Meta Ads', 'Google Ads', 'تحليل بيانات', 'إدارة محتوى'],
    summary: 'متخصصة في قيادة الفرق التسويقية وإدارة ميزانيات الحملات الإعلانية باحترافية.',
    cvFileName: 'Fatima_Marketing_CV.pdf',
    status: 'hired',
    appliedAt: '2026-08-31 11:20'
  }
];

export const JobsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants' | 'commissions' | 'analytics'>('jobs');
  const [jobs, setJobs] = useState<AdminJobPosting[]>(INITIAL_ADMIN_JOBS);
  const [applicants, setApplicants] = useState<AdminJobApplicant[]>(INITIAL_APPLICANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  
  // النافذة المنبثقة لمراجعة المتقدم ومطابقة الذكاء الاصطناعي YR AI
  const [selectedApplicant, setSelectedApplicant] = useState<AdminJobApplicant | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // حساب المطابقة الذكية للمتقدم المختار
  const matchResult = useMemo(() => {
    if (!selectedApplicant) return null;
    const targetJob = jobs.find(j => j.id === selectedApplicant.jobId);
    if (!targetJob) return null;

    return calculateYRMatch(
      {
        id: selectedApplicant.id,
        name: selectedApplicant.name,
        title: selectedApplicant.jobTitle,
        skills: selectedApplicant.skills,
        experienceYears: selectedApplicant.experienceYears,
        city: selectedApplicant.city,
        education: selectedApplicant.education
      },
      {
        id: targetJob.id,
        title: targetJob.title,
        requiredSkills: targetJob.requiredSkills,
        minExperience: 3,
        city: targetJob.city.split('—')[0].trim(),
        jobType: targetJob.jobType
      }
    );
  }, [selectedApplicant, jobs]);

  // تحديث حالة المتقدم وتوثيق الإجراء
  const handleUpdateApplicantStatus = (appId: string, newStatus: AdminJobApplicant['status'], jobTitle: string) => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    if (selectedApplicant && selectedApplicant.id === appId) {
      setSelectedApplicant({ ...selectedApplicant, status: newStatus });
    }

    // إذا تم التوظيف والرسو، تصبح العمولة مستحقة الدفع
    if (newStatus === 'hired') {
      const app = applicants.find(a => a.id === appId);
      if (app) {
        setJobs(prev => prev.map(j => j.id === app.jobId ? { ...j, commissionStatus: 'due' } : j));
      }
    }

    adminAuditService.logAction(`تحديث حالة طلب التوظيف إلى (${newStatus})`, 'job_application', appId, { newStatus, jobTitle });
    setToastMessage(`تم تحديث حالة طلب التوظيف إلى (${newStatus}) بنجاح`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // اعتماد أو رفض سداد عمولة التوظيف (20,000 YER)
  const handleVerifyCommission = (jobId: string, isPaid: boolean) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, commissionStatus: isPaid ? 'paid' : 'due' } : j));
    adminAuditService.logAction(isPaid ? 'اعتماد سداد عمولة التوظيف (20,000 YER)' : 'رفض إثبات سداد عمولة التوظيف', 'job_commission', jobId, { isPaid });
    setToastMessage(isPaid ? 'تم اعتماد سداد عمولة التوظيف بنجاح ✓' : 'تم رفض إثبات السداد');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // الإحصائيات الحية
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalApplicantsCount = applicants.length;
    const hiredCount = applicants.filter(a => a.status === 'hired').length;
    const totalCommissionsPaid = jobs.filter(j => j.commissionStatus === 'paid').reduce((acc, j) => acc + j.commissionAmount, 0);
    const dueCommissions = jobs.filter(j => j.commissionStatus === 'due' || j.commissionStatus === 'pending_verification').reduce((acc, j) => acc + j.commissionAmount, 0);

    return { totalJobs, activeJobs, totalApplicantsCount, hiredCount, totalCommissionsPaid, dueCommissions };
  }, [jobs, applicants]);

  return (
    <div dir="rtl" className="space-y-5 font-['Cairo',sans-serif] text-white">
      
      {/* رأس صفحة إدارة الوظائف */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17] p-4 rounded-2xl border border-[#1F2937]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase className="text-[#FFC500]" />
            مركز إدارة الوظائف والمطابقة الذكية والعمولات
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            متابعة إعلانات التوظيف، فحص السير الذاتية بمحرك YR AI، وتتبع عمولة التوظيف الثابتة (20,000 ريال يمني)
          </p>
        </div>

        {/* التبويبات الإدارية الأربعة */}
        <div className="flex gap-1 bg-[#161D2B] p-1 rounded-xl border border-[#1F2937] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'jobs' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            الوظائف المنشورة ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'applicants' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            المتقدمون والمطابقة الذكية ({applicants.length})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'commissions' ? 'bg-[#16A34A] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            عمولات التوظيف ({jobs.filter(j => j.commissionStatus === 'pending_verification' || j.commissionStatus === 'due').length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            التقارير والمؤشرات
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#16A34A]/20 border border-[#16A34A] rounded-xl text-xs font-bold text-white flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#16A34A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* بطاقات الإحصائيات المتقدمة لقطاع التوظيف */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">الوظائف النشطة المتاحة:</span>
          <div className="text-xl font-black text-white mt-1">
            {stats.activeJobs} <span className="text-xs font-['Cairo']">وظيفة معتمدة</span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo']">إجمالي الإعلانات: {stats.totalJobs}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">إجمالي طلبات التوظيف:</span>
          <div className="text-xl font-black text-[#FFC500] mt-1">
            {stats.totalApplicantsCount} <span className="text-xs font-['Cairo']">سيرة ذاتية</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-['Cairo']">تم توظيفهم: {stats.hiredCount} كادر</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">عمولات التوظيف المحصلة:</span>
          <div className="text-xl font-black text-[#16A34A] mt-1">
            {stats.totalCommissionsPaid.toLocaleString()} <span className="text-xs">YER</span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo']">عمولة ثابتة 20,000 ﷼ لكل توظيف</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">العمولات المستحقة للتحصيل:</span>
          <div className="text-xl font-black text-[#DC2626] mt-1">
            {stats.dueCommissions.toLocaleString()} <span className="text-xs">YER</span>
          </div>
          <span className="text-[10px] text-amber-400 font-['Cairo']">تستحق من راتب الشهر الأول</span>
        </div>
      </div>

      {/* ============================================================
          تبويب 1: جدول الوظائف المنشورة والتحكم الإداري
          ============================================================ */}
      {activeTab === 'jobs' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3 shadow-xl">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-1.5 text-xs flex-1 max-w-md">
              <Search size={14} className="text-gray-400 ml-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالمسمى الوظيفي أو اسم الشركة..."
                className="bg-transparent text-white outline-none w-full"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-1.5 text-xs text-gray-300 outline-none"
            >
              <option value="all">كل المحافظات</option>
              <option value="صنعاء">صنعاء</option>
              <option value="عدن">عدن</option>
              <option value="تعز">تعز</option>
              <option value="حضرموت">حضرموت</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
                <tr>
                  <th className="py-3 px-3">المسمى الوظيفي</th>
                  <th className="py-3 px-3">جهة العمل (بيانات سرية)</th>
                  <th className="py-3 px-3">المدينة والدوام</th>
                  <th className="py-3 px-3">الراتب التقديري</th>
                  <th className="py-3 px-3 text-center">المتقدمون</th>
                  <th className="py-3 px-3 text-[#FFC500] text-center">عمولة التوظيف</th>
                  <th className="py-3 px-3 text-center">حالة الإعلان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-[#161D2B]/50">
                    <td className="py-3 px-3 font-bold">
                      <div>{job.title}</div>
                      <span className="text-[10px] text-gray-400 font-mono">{job.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-white font-bold">{job.employerName}</div>
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Phone size={10} className="text-[#FFC500]" /> {job.employerPhone}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      <div>{job.city}</div>
                      <span className="text-[10px] text-[#16A34A]">{job.jobType}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {job.salary.toLocaleString()} {job.currency}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setActiveTab('applicants')}
                        className="px-2.5 py-1 rounded-lg bg-[#161D2B] hover:bg-[#FFC500] hover:text-black font-mono font-bold text-xs text-[#FFC500] transition-colors"
                      >
                        {job.applicantsCount} متقدم
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#FFC500]">
                      {job.commissionAmount.toLocaleString()} YER
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {job.status === 'active' ? 'معتمدة ونشطة' : 'مغلقة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 2: إدارة المتقدمين والمطابقة الذكية YR AI MATCH
          ============================================================ */}
      {activeTab === 'applicants' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu size={16} className="text-[#FFC500]" />
              طلبات التوظيف ومحرك المطابقة الذكية (YR AI Match Engine)
            </h3>
            <span className="text-[10px] text-gray-400">يتم ترتيب وتقييم المتقدمين بحسب أعلى نسبة توافق</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
                <tr>
                  <th className="py-3 px-3">اسم المتقدم</th>
                  <th className="py-3 px-3">الوظيفة المتقدم لها</th>
                  <th className="py-3 px-3">المدينة والخبرة</th>
                  <th className="py-3 px-3 text-center text-[#FFC500]">نسبة المطابقة YR AI</th>
                  <th className="py-3 px-3">السيرة الذاتية</th>
                  <th className="py-3 px-3 text-center">حالة الطلب</th>
                  <th className="py-3 px-3 text-center">إجراءات المطابقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white">
                {applicants.map(app => {
                  const targetJob = jobs.find(j => j.id === app.jobId);
                  const score = targetJob ? calculateYRMatch(
                    { id: app.id, name: app.name, title: app.jobTitle, skills: app.skills, experienceYears: app.experienceYears, city: app.city, education: app.education },
                    { id: targetJob.id, title: targetJob.title, requiredSkills: targetJob.requiredSkills, minExperience: 3, city: targetJob.city, jobType: targetJob.jobType }
                  ).score : 75;

                  return (
                    <tr key={app.id} className="hover:bg-[#161D2B]/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{app.name}</div>
                        <span className="text-[10px] text-gray-400 font-mono">{app.phone}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-300 font-bold">{app.jobTitle}</td>
                      <td className="py-3 px-3 text-gray-400">{app.city} • {app.experienceYears} سنوات خبرة</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black border ${
                          score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          score >= 60 ? 'bg-[#FFC500]/20 text-[#FFC500] border-[#FFC500]/30' : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}>
                          {score}% توافق
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-[#2EA5FF] flex items-center gap-1 font-mono hover:underline cursor-pointer">
                          <FileText size={12} /> {app.cvFileName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'hired' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                          app.status === 'interview_scheduled' ? 'bg-[#FFC500]/20 text-[#FFC500]' :
                          app.status === 'under_review' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {app.status === 'hired' ? 'تم التوظيف والرسو ✓' :
                           app.status === 'interview_scheduled' ? 'مقابلة منسقة' :
                           app.status === 'under_review' ? 'قيد المراجعة' : 'طلب جديد'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedApplicant(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-bold text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 mx-auto"
                        >
                          <Eye size={12} />
                          <span>فحص ومطابقة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 3: إدارة وتحصيل عمولات التوظيف (20,000 YER)
          ============================================================ */}
      {activeTab === 'commissions' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CreditCard size={16} className="text-[#16A34A]" /> عمولات التوظيف المعتمدة (20,000 ريال يمني)
            </h3>
            <span className="text-[10px] text-gray-400">تستحق العمولة الثابتة من راتب الشهر الأول عند استقرار التوظيف</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobs.map(job => (
              <div key={job.id} className="p-3.5 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white">{job.title}</h4>
                    <span className="text-[10px] text-gray-400">جهة العمل: {job.employerName} ({job.employerPhone})</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-[#9CA3AF] block font-['Cairo']">العمولة الثابتة:</span>
                    <b className="text-[#16A34A] text-sm">{job.commissionAmount.toLocaleString()} YER</b>
                  </div>
                </div>

                <div className="p-2 bg-[#0F0F12] rounded-lg text-xs flex justify-between items-center font-mono">
                  <span className="text-gray-300 font-['Cairo']">حالة سداد العمولة:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-['Cairo'] ${
                    job.commissionStatus === 'paid' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                    job.commissionStatus === 'pending_verification' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {job.commissionStatus === 'paid' ? 'تم التحصيل والسداد ✓' :
                     job.commissionStatus === 'pending_verification' ? 'بانتظار التحقق من الإيصال' : 'مستحقة'}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  {job.commissionStatus !== 'paid' ? (
                    <button
                      onClick={() => handleVerifyCommission(job.id, true)}
                      className="flex-1 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#16A34A]/90 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check size={14} /> اعتماد تحصيل العمولة (20,000 ﷼)
                    </button>
                  ) : (
                    <div className="w-full text-center py-1.5 text-xs text-[#16A34A] font-bold bg-[#16A34A]/10 rounded-lg">
                      تم تسوية وتحصيل العمولة بنجاح
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 4: التقارير والمؤشرات
          ============================================================ */}
      {activeTab === 'analytics' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <TrendingUp size={16} className="text-[#FFC500]" /> مؤشرات الأداء لقطاع الوساطة والتوظيف
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-1">
              <span className="text-[#9CA3AF]">معدل نجاح المطابقة الذكية YR AI:</span>
              <div className="text-lg font-black text-emerald-400 font-mono">87.4%</div>
              <p className="text-[10px] text-gray-400">مطابقة دقيقة مبنية على المهارات والخبرات الفعلية</p>
            </div>

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-1">
              <span className="text-[#9CA3AF]">متوسط الرواتب المعروضة بالمنصة:</span>
              <div className="text-lg font-black text-[#FFC500] font-mono">486,000 YER</div>
              <p className="text-[10px] text-gray-400">في محافظات صنعاء، عدن، تعز، وحضرموت</p>
            </div>

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-1">
              <span className="text-[#9CA3AF]">متوسط وقت إغلاق شواغر التوظيف:</span>
              <div className="text-lg font-black text-blue-400 font-mono">4.2 أيام</div>
              <p className="text-[10px] text-gray-400">بفضل نظام الإشعارات والمطابقة التلقائية</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          نافذة فحص المتقدم وتفاصيل المطابقة الذكية YR AI Match
          ============================================================ */}
      {selectedApplicant && matchResult && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedApplicant(null)}
        >
          <div 
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-lg p-5 space-y-3.5 shadow-2xl cursor-default max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#222226] pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-[#FFC500]" />
                <h3 className="text-sm font-bold text-white">تحليل المطابقة الذكية YR AI — {selectedApplicant.name}</h3>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* بطاقة النسبة الإجمالية */}
            <div className="p-3.5 bg-gradient-to-r from-[#161D2B] to-[#0F0F12] border border-[#FFC500]/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#D1D5DB]">نسبة التوافق مع شاغر:</span>
                <h4 className="text-sm font-black text-white mt-0.5">{selectedApplicant.jobTitle}</h4>
              </div>
              <div className="text-center font-mono">
                <span className={`text-2xl font-black ${
                  matchResult.score >= 80 ? 'text-emerald-400' : matchResult.score >= 60 ? 'text-[#FFC500]' : 'text-gray-400'
                }`}>
                  {matchResult.score}%
                </span>
                <span className="text-[9px] text-[#9CA3AF] block font-['Cairo']">مطابقة دقيقة</span>
              </div>
            </div>

            {/* تفصيل نقاط المطابقة */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-[#18181C] rounded-lg border border-[#27272A] flex justify-between">
                <span className="text-gray-400 font-['Cairo']">المسمى والمهام (35%):</span>
                <b className="text-white">{matchResult.breakdown.titleMatch}%</b>
              </div>
              <div className="p-2 bg-[#18181C] rounded-lg border border-[#27272A] flex justify-between">
                <span className="text-gray-400 font-['Cairo']">المهارات المطلوبة (35%):</span>
                <b className="text-white">{matchResult.breakdown.skillsMatch}%</b>
              </div>
              <div className="p-2 bg-[#18181C] rounded-lg border border-[#27272A] flex justify-between">
                <span className="text-gray-400 font-['Cairo']">سنوات الخبرة (15%):</span>
                <b className="text-white">{matchResult.breakdown.experienceMatch}%</b>
              </div>
              <div className="p-2 bg-[#18181C] rounded-lg border border-[#27272A] flex justify-between">
                <span className="text-gray-400 font-['Cairo']">المدينة والموقع (15%):</span>
                <b className="text-white">{matchResult.breakdown.cityMatch}%</b>
              </div>
            </div>

            {/* تفاصيل المتقدم والسيرة الذاتية */}
            <div className="p-3 bg-[#18181C] rounded-xl border border-[#27272A] space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span>رقم الهاتف: <b className="text-white font-mono">{selectedApplicant.phone}</b></span>
                <span>البريد: <b className="text-white font-mono">{selectedApplicant.email}</b></span>
              </div>
              <div>المؤهل العلمي: <b className="text-white">{selectedApplicant.education}</b></div>
              <div>المهارات المسجلة: <b className="text-[#FFC500]">{selectedApplicant.skills.join(' • ')}</b></div>
              <p className="text-[11px] text-gray-300 pt-1 border-t border-[#27272A]">
                "{selectedApplicant.summary}"
              </p>
            </div>

            {/* الإجراءات والمراحل الإدارية */}
            <div className="space-y-2 pt-2 border-t border-[#222226]">
              <label className="text-xs font-bold text-white block">اتخاذ قرار وتحديث مرحلة المتقدم:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateApplicantStatus(selectedApplicant.id, 'interview_scheduled', selectedApplicant.jobTitle)}
                  className="py-2 bg-[#FFC500] text-black font-black text-xs rounded-xl hover:bg-[#FFC500]/90 transition-all cursor-pointer shadow-md"
                >
                  تنسيق مقابلة
                </button>
                <button
                  onClick={() => handleUpdateApplicantStatus(selectedApplicant.id, 'hired', selectedApplicant.jobTitle)}
                  className="py-2 bg-[#16A34A] text-white font-black text-xs rounded-xl hover:bg-[#16A34A]/90 transition-all cursor-pointer shadow-md"
                >
                  اعتماد التوظيف والرسو
                </button>
                <button
                  onClick={() => handleUpdateApplicantStatus(selectedApplicant.id, 'rejected', selectedApplicant.jobTitle)}
                  className="py-2 bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/40 font-bold text-xs rounded-xl hover:bg-[#DC2626]/30 cursor-pointer"
                >
                  رفض الطلب
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
