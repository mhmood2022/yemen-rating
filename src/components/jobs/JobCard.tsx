import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Building2, ShieldCheck, Sparkles, Briefcase } from 'lucide-react';

interface JobCardProps {
  job: any;
  onApply?: (job: any) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {

  // دالة تنظيف الوصف من نصوص الوساطة السرية
  const cleanExcerpt = (raw: string = '') => {
    if (!raw) return '';
    let c = raw.split('--- [بيانات جهة النشر والوساطة] ---')[0];
    c = c.split('[معلومات جهة العمل والتواصل]')[0];
    c = c.split('[ملف الوصف الوظيفي PDF]')[0];
    return c.trim();
  };

  // دالة تنظيف وتنسيق الراتب
  const formatSalary = (raw: string = '') => {
    if (!raw) return 'عند المقابلة';
    let s = raw.trim();
    if (s.includes('عند المقابلة') || s.includes('بحسب المقابلة')) {
      return 'عند المقابلة';
    }
    s = s.replace(/\s*\(قابل للتفاوض\)/g, '').trim();
    return s;
  };

  const jobType = job.type || job.work_type || 'دوام كامل';
  const salary = job.salary || job.salary_range;

  return (
    <div className="flex flex-col justify-between bg-[#0B0F19] border border-slate-800/90 hover:border-[#FFC500]/50 rounded-2xl p-3.5 sm:p-4 shadow-xl transition-all duration-300 font-['Cairo',sans-serif] group relative overflow-hidden">
      
      {/* توهج خفيف على الزاوية عند التحويم */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC500]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FFC500]/10 transition-colors" />

      <div>
        {/* الرأس: وساطة معتمدة + حالة التقديم */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFC500]/10 border border-[#FFC500]/30 text-[#FFC500] text-[11px] font-bold shadow-sm">
            <Briefcase size={12} className="text-[#FFC500]" />
            <span>وظيفة</span>
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            متاحة للتقديم
          </span>
        </div>

        {/* مسمى الوظيفة */}
        <h3 className="text-base font-black text-white group-hover:text-[#FFC500] transition-colors line-clamp-1 mb-2">
          {job.title}
        </h3>

        {/* سرية المنشأة */}
        {job.description ? (
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3.5 min-h-[2rem]">
            {cleanExcerpt(job.description)}
          </p>
        ) : (
          <div className="h-4 mb-3.5" />
        )}

        {/* البادجات: المدينة، نوع العمل، الخبرة */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {job.city && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111625] border border-slate-800 text-slate-300 font-medium">
              <MapPin size={12} className="text-[#FFC500]" />
              <span>{job.city}</span>
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
            {jobType}
          </span>
          {job.gender && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold">
              {job.gender}
            </span>
          )}
          {job.experience && (
            <span className="px-2.5 py-1 rounded-lg bg-[#111625] border border-slate-800 text-slate-300">
              {job.experience}
            </span>
          )}
        </div>
      </div>

      {/* أسفل الكرت: الراتب وزر التقديم */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">الراتب:</span>
          <span className="text-xs font-black text-[#FFC500] whitespace-nowrap">
            {formatSalary(salary)}
          </span>
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFC500] hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all shadow-md group-hover:shadow-[#FFC500]/20 cursor-pointer"
        >
          <span>عرض الوظيفة</span>
          <ArrowLeft size={13} className="rtl:rotate-0" />
        </Link>
      </div>

    </div>
  );
};

export default JobCard;
