import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, MapPin, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { JobCard } from '../jobs/JobCard';

interface JobsPageProps {
  onBack?: () => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ onBack }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');

  // نافذة أضف وظيفة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSector, setNewSector] = useState('إدارية ومحاسبة');
  const [newWorkType, setNewWorkType] = useState('دوام كامل');
  const [newCity, setNewCity] = useState('صنعاء');
  const [newSalaryRange, setNewSalaryRange] = useState('');
  const [newExperienceLevel, setNewExperienceLevel] = useState('1-3 سنوات');
  const [newDescription, setNewDescription] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
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
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !agreedToPolicy) return;

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
      setAgreedToPolicy(false);
      setToastMessage('تم نشر الوظيفة بنجاح وتوثيق عمولة ووساطة يمن ريتغ');
      setTimeout(() => setToastMessage(null), 4000);
      fetchJobs();
    } catch (err: any) {
      setToastMessage(err.message || 'تم إرسال الوظيفة للمراجعة');
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

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="4" className="mb-2" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#D4AF37] text-[#0B1325] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس مع زر أضف وظيفة */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#162238] border border-slate-700 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] transition-all"
            >
              <ArrowRight size={16} className="rtl:rotate-180" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-lg sm:text-xl font-black text-white">فرص العمل والوظائف الشاغرة</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#c5a230] text-[#0B1325] font-black rounded-lg text-xs transition-colors shadow-md"
          >
            <Plus size={15} />
            <span>أضف وظيفة</span>
          </button>

          <button
            onClick={fetchJobs}
            disabled={loading}
            className="p-2 bg-[#162238] border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
          </button>
        </div>
      </div>

      {/* شريط سياسة الوساطة وحجب المنشأة */}
      <div className="bg-[#162238] border border-[#D4AF37]/30 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
        <span>منصة يمن ريتغ تعمل كوسيط رسمي مباشر؛ يتم حجب بيانات المنشأة لضمان سرية وموثوقية التنسيق الوظيفي وسداد عمولة التوظيف المعتمدة.</span>
      </div>

      {/* شريط الفلترة */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#162238] p-3 rounded-xl border border-slate-700/60">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#0B1325] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">كافة المدن</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت</option>
          </select>

          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="bg-[#0B1325] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">كافة أنواع الدوام</option>
            <option value="دوام كامل">دوام كامل</option>
            <option value="دوام جزئي">دوام جزئي</option>
            <option value="عن بعد">عن بعد</option>
            <option value="عقد">عقد</option>
          </select>
        </div>

        <span className="text-xs text-[#D4AF37] font-bold">
          الوظائف المتاحة: {filteredJobs.length}
        </span>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <span className="text-xs font-bold">جاري تحميل الوظائف الحقيقية...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-16 text-center bg-[#162238] rounded-2xl border border-slate-700/60 p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد وظائف شاغرة معلنة حالياً</h3>
          <p className="text-xs text-slate-400">كن أول من ينشر شاغراً بالضغط على زر "أضف وظيفة" أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* نافذة أضف وظيفة مع سياسة الوساطة وعمولة التوظيف */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162238] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto font-['Cairo'] text-white">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-[#D4AF37]" /> إضافة شاغر وظيفي جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-[#0B1325] text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">المسمى الوظيفي *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: محاسب مالي أول"
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">القطاع الوظيفي *</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="إدارية ومحاسبة">إدارية ومحاسبة</option>
                    <option value="تقنية معلومات وبرمجة">تقنية معلومات وبرمجة</option>
                    <option value="تسويق ومبيعات">تسويق ومبيعات</option>
                    <option value="هندسة وتصميم">هندسة وتصميم</option>
                    <option value="طب وصيدلة">طب وصيدلة</option>
                    <option value="خدمات عامة">خدمات عامة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">المدينة *</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت">حضرموت</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">نوع العمل *</label>
                  <select
                    value={newWorkType}
                    onChange={(e) => setNewWorkType(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="دوام كامل">دوام كامل</option>
                    <option value="دوام جزئي">دوام جزئي</option>
                    <option value="عن بعد">عن بعد</option>
                    <option value="عقد">عقد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">مستوى الخبرة</label>
                  <select
                    value={newExperienceLevel}
                    onChange={(e) => setNewExperienceLevel(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="1-3 سنوات">1-3 سنوات</option>
                    <option value="3-5 سنوات">3-5 سنوات</option>
                    <option value="5+ سنوات">5+ سنوات</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الراتب المتوقع أو المقترح</label>
                <input
                  type="text"
                  value={newSalaryRange}
                  onChange={(e) => setNewSalaryRange(e.target.value)}
                  placeholder="مثال: 400,000 - 600,000 ريال يمني"
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الوصف وشروط التقديم *</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="اكتب المهام والمسؤوليات والمؤهلات المطلوبة..."
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* سياسة عمولة التوظيف وحجب اسم المنشأة */}
              <div className="p-3 bg-[#0B1325] rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck size={16} className="text-[#D4AF37]" />
                  <span>سياسة الوساطة الوظيفية وعمولة التوظيف</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تلتزم جهة العمل بسياسة وساطة يمن ريتغ، وتوافق على حجب اسم المنشأة عن المتقدمين لضمان حصر التقديم عبر المنصة، وتلتزم بسداد عمولة التوظيف المعتمدة عند توظيف أي مرشح محال عبر المنصة.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToPolicy}
                    onChange={(e) => setAgreedToPolicy(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span className="text-[11px] font-bold text-white">أوافق على سياسة وساطة وتوظيف وعمولة يمن ريتغ</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToPolicy || submitting}
                  className="px-5 py-2 rounded-lg bg-[#D4AF37] disabled:opacity-40 text-[#0B1325] font-black text-xs transition-colors"
                >
                  {submitting ? 'جاري النشر...' : 'نشر الشاغر الوظيفي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
