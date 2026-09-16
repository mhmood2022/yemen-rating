import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft } from 'lucide-react';

export interface JobCardData {
  id: string;
  title: string;
  city: string;
  sector?: string;
  work_type?: string;
  workType?: string;
  experience_level?: string;
  salary_range?: string | null;
  salaryRange?: string | null;
  deadline?: string | null;
  status: string;
  created_at?: string;
}

interface JobCardProps {
  job: JobCardData | any;
  onApply?: (job: any) => void;
  onNavigateCompany?: (companyId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const workType = job.work_type || job.workType;
  const salary = job.salary_range || job.salaryRange;

  return (
    <div className="flex flex-col bg-[#0D1527] border border-slate-800 hover:border-[#F5C400]/50 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-300 font-['Cairo']">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug">
          {job.title}
        </h3>
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-[#060A13] text-emerald-400 border border-emerald-500/30 shrink-0">
          {(job.status === 'ACTIVE' || job.status === 'PUBLISHED') ? 'متاحة للتقديم' : (job.status || 'متاحة')}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        {job.city && (
          <span className="flex items-center gap-1 text-slate-300">
            <MapPin className="w-3 h-3 text-[#F5C400] shrink-0" />
            <span>{job.city}</span>
          </span>
        )}
        {workType && (
          <span className="px-2 py-0.5 rounded bg-[#060A13] border border-slate-800 text-slate-300 font-bold">
            {workType}
          </span>
        )}
        {job.sector && (
          <span className="px-2 py-0.5 rounded bg-[#060A13] border border-slate-800 text-slate-300">
            {job.sector}
          </span>
        )}
      </div>

      <div className="py-2.5 border-y border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
        {salary ? (
          <span className="text-[#F5C400] font-bold">
            {salary}
          </span>
        ) : (
          <span className="text-slate-400">الراتب بحسب المقابلة</span>
        )}

        {job.deadline && (
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>تنتهي: {job.deadline}</span>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex justify-end">
        {onApply ? (
          <button
            type="button"
            onClick={() => onApply(job)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black text-xs font-black rounded-lg transition-colors shadow-sm"
          >
            <span>عرض الوظيفة والتقديم</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black text-xs font-black rounded-lg transition-colors shadow-sm"
          >
            <span>عرض الوظيفة والتقديم</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
