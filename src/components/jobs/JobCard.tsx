import React from 'react';
import { JobVacancy } from '../../types/jobs';
import { Card } from '../ui/Card';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { MapPin, Briefcase, Clock, Sparkles, DollarSign, ArrowLeft } from 'lucide-react';

interface JobCardProps {
  job: JobVacancy;
  onApply: (job: JobVacancy) => void;
  onNavigateCompany?: (companyId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, onNavigateCompany }) => {
  return (
    <Card
      hoverable
      className="p-4 sm:p-5 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] flex flex-col justify-between transition-all duration-200 shadow-sm"
    >
      <div className="space-y-3">
        {/* Header: Company Logo + Title + AI Match Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Company Logo Frame */}
            <div
              onClick={() => onNavigateCompany && onNavigateCompany(job.companyId)}
              className="w-12 h-12 rounded-[10px] overflow-hidden bg-[#0A0A0A] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title and Company */}
            <div className="min-w-0 space-y-0.5">
              <h3 className="font-black text-sm sm:text-base text-[#0B1F3A] dark:text-white leading-snug line-clamp-1">
                {job.title}
              </h3>

              <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-[#A1A1AA] truncate">
                <span
                  onClick={() => onNavigateCompany && onNavigateCompany(job.companyId)}
                  className="font-bold hover:underline cursor-pointer truncate"
                >
                  {job.companyName}
                </span>
                {job.isVerifiedEmployer && (
                  <VerifiedBadge variant={job.verifiedBadgeType || 'gold'} size={13} />
                )}
              </div>
            </div>
          </div>

          {/* AI Match Score Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#F5C400]/15 dark:bg-[#F5C400]/20 text-[#0B1F3A] dark:text-[#F5C400] text-[10px] font-black shrink-0 border border-[#F5C400]/30">
            <Sparkles size={11} strokeWidth={2.5} />
            <span>{job.matchScore}% مطابقة</span>
          </div>
        </div>

        {/* Tags Strip (Sector, WorkType, City, Experience) */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-[6px] bg-[#F7F8FA] dark:bg-[#181818] text-[#0B1F3A] dark:text-[#E4E4E7] border border-[#E2E8F0] dark:border-[#262626]">
            {job.sector}
          </span>
          <span className="px-2.5 py-1 rounded-[6px] bg-[#F7F8FA] dark:bg-[#181818] text-[#0B1F3A] dark:text-[#E4E4E7] border border-[#E2E8F0] dark:border-[#262626]">
            {job.workType}
          </span>
          <span className="px-2 py-1 rounded-[6px] bg-[#F7F8FA] dark:bg-[#181818] text-[#64748B] dark:text-[#A1A1AA] flex items-center gap-1 border border-[#E2E8F0] dark:border-[#262626]">
            <MapPin size={11} className="text-[#F5C400]" />
            <span>{job.city}</span>
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#475569] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Salary Highlight Box */}
        <div className="p-2.5 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] flex items-center justify-between text-xs">
          <span className="text-[#64748B] dark:text-[#71717A] text-[11px]">الراتب والمكافأة:</span>
          <span className="font-black text-[#16A34A] dark:text-[#22C55E]">
            {job.salaryRange}
          </span>
        </div>
      </div>

      {/* Footer: Date & Apply Button */}
      <div className="pt-3 mt-3 border-t border-[#F1F5F9] dark:border-[#1E1E1E] flex items-center justify-between gap-2">
        <span className="text-[10px] text-[#94A3B8] dark:text-[#71717A] flex items-center gap-1">
          <Clock size={11} />
          <span>نشرت {job.postedDate} ({job.applicantsCount} متقدم)</span>
        </span>

        <button
          type="button"
          onClick={() => onApply(job)}
          className="h-[32px] px-3.5 rounded-full bg-[#F5C400] text-black font-black text-xs flex items-center gap-1.5 hover:bg-[#DDAF00] active:scale-95 transition-all shadow-sm"
        >
          <span>تقديم وتفاصيل</span>
          <ArrowLeft size={12} strokeWidth={2.5} />
        </button>
      </div>
    </Card>
  );
};
