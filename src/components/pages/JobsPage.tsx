import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, MapPin, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
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

  const filteredJobs = jobs.filter((job) => {
    const workType = job.work_type || job.workType;
    const matchCity = cityFilter === 'all' || (job.city && job.city.includes(cityFilter));
    const matchType = workTypeFilter === 'all' || workType === workTypeFilter;
    return matchCity && matchType;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="4" className="mb-2" />

      {/* الرأس */}
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

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#162238] border border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* شريط الوساطة التوعوي */}
      <div className="bg-[#162238] border border-[#D4AF37]/30 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
        <span>منصة يمن ريتغ تعمل كوسيط رسمي مباشر؛ يتم حجب بيانات المنشأة لضمان سرية وموثوقية التنسيق الوظيفي.</span>
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
          <p className="text-xs text-slate-400">تابعنا باستمرار للاطلاع على الشواغر الجديدة فور نشرها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
