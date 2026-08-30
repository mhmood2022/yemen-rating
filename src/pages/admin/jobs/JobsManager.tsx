import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Star,
  Clock,
  Coins,
  ShieldCheck,
  Tag,
  Check,
  X,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export type JobStatus = 'active' | 'pending' | 'closed' | 'rejected' | 'expired';
export type JobType = 'دوام كامل' | 'دوام جزئي' | 'عن بُعد (Remote)' | 'تدريب / عقد مؤقت';

export interface AdminJobItem {
  id: string;
  title: string;
  company: string;
  isCompanyVerified: boolean;
  sector: string;
  city: string;
  type: JobType;
  salaryRange: string;
  currency: 'USD' | 'YER' | 'SAR';
  experienceYears: string;
  applicantsCount: number;
  fixedCommission: string;
  status: JobStatus;
  isFeatured: boolean;
  createdAt: string;
  expiresAt: string;
  description: string;
  requirements: string[];
  rejectionReason?: string;
}

const INITIAL_JOBS: AdminJobItem[] = [
  {
    id: 'JOB-301',
    title: 'مهندس برمجيات وتطبيقات سحابية (Full Stack React/Node)',
    company: 'شركة يمن سوفت للحلول والأنظمة',
    isCompanyVerified: true,
    sector: 'تقنية المعلومات والبرمجيات',
    city: 'صنعاء',
    type: 'دوام كامل',
    salaryRange: '$1,200 - $1,800',
    currency: 'USD',
    experienceYears: '3 - 5 سنوات',
    applicantsCount: 18,
    fixedCommission: '$150 USD',
    status: 'active',
    isFeatured: true,
    createdAt: '2026-08-20',
    expiresAt: '2026-09-20',
    description: 'مطلوب مهندس برمجيات ذو كفاءة لتطوير وصيانة المنصات المؤسسية والأنظمة السحابية باستخدام أحدث التقنيات.',
    requirements: ['إتقان React و TypeScript و Node.js', 'خبرة في قواعد البيانات PostgreSQL / Supabase', 'مهارات تواصل ممتازة والعمل ضمن فريق']
  },
  {
    id: 'JOB-302',
    title: 'مدير تسويق رقمي وحملات إعلانية وتواصل اجتماعي',
    company: 'مجموعة هائل سعيد أنعم التجارية',
    isCompanyVerified: true,
    sector: 'التسويق والمبيعات',
    city: 'عدن / تعز',
    type: 'دوام كامل',
    salaryRange: '$1,000 - $1,500',
    currency: 'USD',
    experienceYears: '4 سنوات',
    applicantsCount: 24,
    fixedCommission: '$200 USD',
    status: 'active',
    isFeatured: true,
    createdAt: '2026-08-24',
    expiresAt: '2026-09-24',
    description: 'قيادة الحملات التسويقية الرقمية لمنتجات المجموعة، وإدارة الميزانيات الإعلانية ومؤشرات الأداء (KPIs).',
    requirements: ['خبرة موثقة في إدارة إعلانات Meta و Google', 'إتقان استراتيجيات النمو وصناعة المحتوى الإبداعي', 'قدرة على تحليل البيانات المالية للحملات']
  },
  {
    id: 'JOB-303',
    title: 'محاسب مالي قانوني وتدقيق حسابات',
    company: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    isCompanyVerified: true,
    sector: 'المحاسبة والمالية',
    city: 'حضرموت - المكلا',
    type: 'دوام كامل',
    salaryRange: '450,000 - 600,000 YER',
    currency: 'YER',
    experienceYears: '2 - 3 سنوات',
    applicantsCount: 12,
    fixedCommission: '$100 USD',
    status: 'closed',
    isFeatured: false,
    createdAt: '2026-08-10',
    expiresAt: '2026-08-28',
    description: 'متابعة العمليات المحاسبية اليومية، مراجعة السجلات والقيود، وإعداد التقارير المالية الدورية للفرع.',
    requirements: ['بكالوريوس محاسبة بتقدير جيد جداً على الأقل', 'إتقان الأنظمة المصرفية وبرامج الأوفيس', 'دقة عالية في المعاملات المالية']
  },
  {
    id: 'JOB-304',
    title: 'أخصائي خدمة عملاء ودعم فني هاتفي',
    company: 'شركة يمن موبايل للاتصالات',
    isCompanyVerified: true,
    sector: 'خدمة العملاء والاتصالات',
    city: 'صنعاء',
    type: 'دوام كامل',
    salaryRange: '250,000 - 350,000 YER',
    currency: 'YER',
    experienceYears: 'سنة خبرة',
    applicantsCount: 45,
    fixedCommission: '$80 USD',
    status: 'pending',
    isFeatured: false,
    createdAt: '2026-08-30',
    expiresAt: '2026-09-30',
    description: 'استقبال استفسارات المشتركين وتقديم الحلول الفنية للباقات والخدمات مع الحفاظ على مستوى عالٍ من الرضا.',
    requirements: ['لباقة وحسن تصرف وصبر في التواصل', 'مهارات استخدام الحاسوب وسرعة الطباعة', 'الاستعداد للعمل بنظام النوبات']
  }
];

export const JobsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'sectors' | 'commissions'>('jobs');
  const [jobs, setJobs] = useState<AdminJobItem[]>(INITIAL_JOBS);
  
  // فلاتر البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  // نافذة مراجعة الوظيفة
  const [selectedJob, setSelectedJob] = useState<AdminJobItem | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // نافذة إضافة وظيفة جديدة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('صنعاء');
  const [newSector, setNewSector] = useState('تقنية المعلومات والبرمجيات');
  const [newType, setNewType] = useState<JobType>('دوام كامل');
  const [newSalary, setNewSalary] = useState('');
  const [newCommission, setNewCommission] = useState('$100 USD');
  const [newDesc, setNewDesc] = useState('');

  // تغيير حالة الوظيفة
  const handleUpdateStatus = (id: string, newStatus: JobStatus, reason?: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === id ? { ...j, status: newStatus, rejectionReason: reason || j.rejectionReason } : j))
    );
    setSelectedJob(null);
    setRejectionModalOpen(false);
    setRejectionReasonText('');
  };

  // تمييز الوظيفة (Toggle Featured)
  const handleToggleFeatured = (id: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === id ? { ...j, isFeatured: !j.isFeatured } : j))
    );
  };

  // حذف الوظيفة
  const handleDeleteJob = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان الوظيفي؟')) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  // إضافة وظيفة جديدة
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const newJob: AdminJobItem = {
      id: `JOB-${Date.now().toString().slice(-3)}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      isCompanyVerified: true,
      sector: newSector,
      city: newCity,
      type: newType,
      salaryRange: newSalary || 'غير محدد (يحدد في المقابلة)',
      currency: 'USD',
      experienceYears: 'سنتان',
      applicantsCount: 0,
      fixedCommission: newCommission,
      status: 'active',
      isFeatured: false,
      createdAt: '2026-08-30',
      expiresAt: '2026-09-30',
      description: newDesc || 'فرصة عمل مميزة لدى إحدى الشركات الرائدة.',
      requirements: ['إتقان المهام الأساسية للوظيفة', 'الالتزام والانضباط المهني']
    };

    setJobs(prev => [newJob, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCompany('');
    setNewDesc('');
  };

  // تصفية الوظائف
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch =
        j.title.includes(searchQuery) ||
        j.company.includes(searchQuery) ||
        j.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || j.status === statusFilter;
      const matchCity = cityFilter === 'all' || j.city.includes(cityFilter);
      const matchSector = sectorFilter === 'all' || j.sector === sectorFilter;
      return matchSearch && matchStatus && matchCity && matchSector;
    });
  }, [jobs, searchQuery, statusFilter, cityFilter, sectorFilter]);

  // إحصائيات سريعة
  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicantsCount, 0),
  };

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة والتبويبات */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">إدارة الوظائف والتوظيف</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                مراجعة شواغر الشركات المعتمدة، تصنيف مجالات العمل، ومتابعة عوائد التوظيف
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-yellow-500/10"
            >
              <Plus className="w-4 h-4" /> إضافة شاغر وظيفي
            </button>
          </div>
        </div>

        {/* أزرار التبويبات */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'jobs', label: 'جميع الشواغر الوظيفية', icon: Briefcase, count: stats.total },
            { id: 'sectors', label: 'قطاعات ومجالات العمل', icon: Layers },
            { id: 'commissions', label: 'سياسة عمولات التوظيف', icon: Coins },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. مؤشرات الأداء السريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-zinc-400 font-semibold block">إجمالي الشواغر</span>
          <span className="text-xl font-black text-white mt-1 block">{stats.total} وظيفة</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-emerald-400 font-semibold block">الشواغر النشطة</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">{stats.active}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-amber-400 font-semibold block">قيد المراجعة</span>
          <span className="text-xl font-black text-amber-400 mt-1 block">{stats.pending}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-yellow-400 font-semibold block">إجمالي المتقدمين</span>
          <span className="text-xl font-black text-yellow-400 mt-1 block">{stats.totalApplicants} متقدم</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* التبويب 1: جدول الشواغر الوظيفية                            */}
      {/* ========================================================= */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* شريط البحث والفلاتر */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="بحث بالمسمى الوظيفي، اسم الشركة، أو الرقم..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشطة ومتاحة (Active)</option>
              <option value="pending">قيد المراجعة (Pending)</option>
              <option value="closed">مكتملة ومغلقة (Closed)</option>
              <option value="rejected">مرفوضة (Rejected)</option>
            </select>

            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">كل المدن</option>
              <option value="صنعاء">صنعاء</option>
              <option value="عدن">عدن</option>
              <option value="تعز">تعز</option>
              <option value="المكلا">حضرموت - المكلا</option>
              <option value="الحديدة">الحديدة</option>
              <option value="مأرب">مأرب</option>
            </select>
          </div>

          {/* قائمة الشواغر */}
          <div className="space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
                لا توجد شواغر مطابقة لمعايير البحث الحالية.
              </div>
            ) : (
              filteredJobs.map(job => (
                <div
                  key={job.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-zinc-950 border transition-all ${
                    job.status === 'pending'
                      ? 'border-amber-500/40 bg-amber-950/5'
                      : 'border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* معلومات الوظيفة */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700">
                          {job.id}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {job.sector}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                          {job.type}
                        </span>
                        {job.isFeatured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400" /> وظيفة مميزة
                          </span>
                        )}
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            job.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : job.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              : job.status === 'closed'
                              ? 'bg-zinc-800 text-zinc-400'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {job.status === 'active' && '● متاحة للتقديم'}
                          {job.status === 'pending' && '⏳ قيد المراجعة'}
                          {job.status === 'closed' && '✓ مكتملة ومغلقة'}
                          {job.status === 'rejected' && '✕ مرفوضة'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-white">{job.title}</h3>

                      <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-yellow-400" /> {job.company}
                          {job.isCompanyVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {job.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-zinc-500" /> المتقدمون: <strong className="text-yellow-400 font-mono">{job.applicantsCount}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> تنتهي في: {job.expiresAt}
                        </span>
                      </div>
                    </div>

                    {/* المخصص والعمولة والإجراءات */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-900 shrink-0">
                      <div className="text-right lg:text-left">
                        <span className="text-[10px] text-zinc-500 block">عمولة التوظيف الثابتة</span>
                        <span className="font-bold text-xs sm:text-sm text-emerald-400 font-mono">
                          {job.fixedCommission}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-yellow-400" /> مراجعة
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(job.id)}
                          className={`p-2 rounded-xl text-xs transition ${
                            job.isFeatured
                              ? 'bg-yellow-500 text-zinc-950'
                              : 'bg-zinc-900 text-zinc-400 hover:text-yellow-400 border border-zinc-800'
                          }`}
                          title="تمييز الإعلان"
                        >
                          <Star className={`w-4 h-4 ${job.isFeatured ? 'fill-zinc-950' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-xl border border-zinc-800 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 2: قطاعات ومجالات العمل                            */}
      {/* ========================================================= */}
      {activeTab === 'sectors' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white">قطاعات ومجالات التوظيف المعتمدة</h2>
            <p className="text-xs text-zinc-400 mt-0.5">توزيع الشواغر وإحصائيات الطلب حسب التخصصات المهنية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'تقنية المعلومات والبرمجيات', count: 12, growth: '+28%' },
              { name: 'المحاسبة والمالية والمصارف', count: 9, growth: '+15%' },
              { name: 'التسويق والمبيعات الرقمية', count: 8, growth: '+20%' },
              { name: 'الهندسة والمقاولات والتخطيط', count: 6, growth: '+10%' },
              { name: 'الرعاية الصحية والطبية', count: 5, growth: '+12%' },
              { name: 'خدمة العملاء والاتصالات', count: 7, growth: '+18%' },
            ].map((sec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white block">{sec.name}</span>
                  <span className="text-xs text-zinc-400 mt-0.5 block">{sec.count} شواغر متاحة</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  {sec.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 3: سياسة عمولات التوظيف                            */}
      {/* ========================================================= */}
      {activeTab === 'commissions' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-yellow-400 pb-3 border-b border-zinc-800">
            <Coins className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">سياسة عمولات وعوائد التوظيف المؤسسي</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            يتم تحديد عمولة توظيف ثابتة (Fixed Commission) بالاتفاق مع الشركات المعتمدة عند إتمام التعيين بنجاح. لا يدفع الباحث عن العمل أي رسوم أو عمولات وتكون الخدمة مجانية 100% للمتقدمين.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-xs text-zinc-400 block">الوظائف الإدارية والتنفيذية</span>
              <span className="font-bold text-sm text-yellow-400 font-mono mt-1 block">$200 - $300 USD</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-xs text-zinc-400 block">الوظائف التقنية والهندسية</span>
              <span className="font-bold text-sm text-yellow-400 font-mono mt-1 block">$150 - $250 USD</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-xs text-zinc-400 block">الوظائف التشغيلية والخدمية</span>
              <span className="font-bold text-sm text-yellow-400 font-mono mt-1 block">$80 - $120 USD</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة مراجعة الوظيفة (Job Review Modal)                    */}
      {/* ========================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">مراجعة الشاغر: {selectedJob.id}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-base text-white">{selectedJob.title}</h4>
                <p className="text-xs text-yellow-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {selectedJob.company}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block">المدينة:</span>
                  <span className="font-bold text-zinc-200">{selectedJob.city}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">نوع الدوام:</span>
                  <span className="font-bold text-zinc-200">{selectedJob.type}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">الراتب المتوقع:</span>
                  <span className="font-bold text-yellow-400">{selectedJob.salaryRange}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">الخبرة المطلوبة:</span>
                  <span className="font-bold text-zinc-200">{selectedJob.experienceYears}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">المتقدمون:</span>
                  <span className="font-bold text-zinc-200">{selectedJob.applicantsCount} متقدم</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">عمولة التوظيف:</span>
                  <span className="font-bold text-emerald-400">{selectedJob.fixedCommission}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-1">الوصف الوظيفي:</span>
                <p className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-xl border border-zinc-800 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-1">شروط ومتطلبات الوظيفة:</span>
                <ul className="space-y-1 bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 list-disc list-inside">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedJob.id, 'active')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> قبول ونشر الإعلان
                </button>

                <button
                  onClick={() => setRejectionModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs border border-rose-500/30 transition"
                >
                  <XCircle className="w-4 h-4" /> رفض الإعلان
                </button>

                {selectedJob.status === 'active' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedJob.id, 'closed')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition"
                  >
                    إغلاق الشاغر
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة سبب الرفض */}
      {rejectionModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-4 h-4" /> سبب رفض إعلان الوظيفة
            </h3>
            <textarea
              placeholder="اكتب سبب الرفض ليتم إرساله للشركة المعلنة (مثال: بيانات التواصل ناقصة، شروط غير مطابقة للمواصفات)..."
              value={rejectionReasonText}
              onChange={e => setRejectionReasonText(e.target.value)}
              className="w-full h-28 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedJob.id, 'rejected', rejectionReasonText)}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-xs transition"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة شاغر جديد */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base text-white">إضافة شاغر وظيفي جديد</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">المسمى الوظيفي:</label>
                <input
                  type="text"
                  placeholder="مثال: مهندس شبكات، مدير فرع..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">اسم الشركة المعلنة:</label>
                <input
                  type="text"
                  placeholder="اسم المنشأة أو الشركة..."
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">المدينة:</label>
                  <select
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
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
                  <label className="block text-xs font-bold text-zinc-300 mb-1">نوع الدوام:</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="دوام كامل">دوام كامل</option>
                    <option value="دوام جزئي">دوام جزئي</option>
                    <option value="عن بُعد (Remote)">عن بُعد (Remote)</option>
                    <option value="تدريب / عقد مؤقت">تدريب / عقد مؤقت</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">الراتب المتوقع:</label>
                  <input
                    type="text"
                    placeholder="مثال: $1,000 USD أو 300,000 YER"
                    value={newSalary}
                    onChange={e => setNewSalary(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">عمولة التوظيف:</label>
                  <input
                    type="text"
                    placeholder="مثال: $150 USD"
                    value={newCommission}
                    onChange={e => setNewCommission(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">وصف مختصر للوظيفة:</label>
                <textarea
                  placeholder="اكتب نبذة عن المهام المطلوبة..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition"
                >
                  إضافة ونشر الشاغر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsManager;
