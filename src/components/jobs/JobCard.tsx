import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';
import {
  NOT_AVAILABLE, parsePropertyFeatures
} from '../../constants/realEstateOptions';
import { formatXTimeAgo } from '../common/XMarketUI';

interface JobCardProps {
  job: any;
  onApply?: (job: any) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [expanded, setExpanded] = useState(false);

  const rawDesc = job.description || '';
  const cleanExcerpt = rawDesc
    .split('--- [بيانات جهة النشر والوساطة] ---')[0]
    .split('[معلومات جهة العمل والتواصل]')[0]
    .split('[ملف الوصف الوظيفي PDF]')[0]
    .split('[وثائق وشهادات المتقدم]')[0]
    .split('[مرفقات الصور]')[0]
    .trim();

  const imgMatch = rawDesc.match(/\[مرفقات الصور\]:\s*([^\s]+)/);
  const jobImg =
    job.image_url ||
    (Array.isArray(job.image_urls) ? job.image_urls[0] : null) ||
    (imgMatch ? imgMatch[1].trim() : null);

  const formatSalary = (raw: string = '') => {
    if (!raw) return 'عند المقابلة';
    const s = raw.trim();
    if (s.includes('عند المقابلة') || s.includes('بحسب المقابلة')) {
      return 'عند المقابلة';
    }
    return s;
  };

  const jobType = job.type || job.work_type || 'دوام كامل';
  const salary = job.salary || job.salary_range;
  const parsed = parsePropertyFeatures(job.requirements);
  const fallbackPairs: { label: string; value: string }[] = [
    ...(job.city ? [{ label: 'المحافظة', value: job.city }] : []),
    { label: 'نوع الوظيفة', value: jobType },
    ...(job.experience ? [{ label: 'الخبرة', value: job.experience }] : []),
    ...(job.gender ? [{ label: 'الجنس', value: job.gender }] : []),
  ];
  const specPairs = (
    parsed.pairs.length > 0 ? parsed.pairs : fallbackPairs
  ).filter((sp) => sp.value && sp.value !== NOT_AVAILABLE);

  const isLongSpecs = specPairs.length > 6;
  const isLongDesc = cleanExcerpt.length > 130;
  const visibleSpecs =
    expanded || !isLongSpecs ? specPairs : specPairs.slice(0, 6);
  const descText =
    isLongDesc && !expanded
      ? `${cleanExcerpt.slice(0, 130)}...`
      : cleanExcerpt;

  return (
    <div className="flex flex-col justify-between bg-black border border-[#2F3336] hover:border-white/30 rounded-2xl p-4 transition font-['Tahoma',sans-serif]">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#2F3336] text-[#E7E9EA] text-[11px] font-bold">
            <Briefcase size={12} className="text-[#FFC500]" />
            <span>{jobType}</span>
          </span>
          <span className="text-[11px] text-[#71767B]">
            {formatXTimeAgo(job.created_at)}
          </span>
        </div>

        <div className="text-[14.5px] leading-[21px] font-bold text-white flex items-center gap-1.5 flex-wrap">
          <span>{job.title}</span>
          <span className="text-[#71767B] font-normal">·</span>
          <span className="text-[#FFC500] font-mono text-[13px]">
            {formatSalary(salary)}
          </span>
        </div>

        {descText && (
          <p className="text-[13px] leading-[19px] text-[#D6D9DB] whitespace-pre-wrap break-words">
            {descText}
          </p>
        )}

        {visibleSpecs.length > 0 && (
          <div className="text-[12px] leading-[19px] flex flex-wrap items-center gap-x-2 gap-y-1">
            {visibleSpecs.map((sp, idx) => (
              <React.Fragment key={`${sp.label}-${idx}`}>
                {idx > 0 && <span className="text-[#536471]">·</span>}
                <span className="inline-flex items-center gap-1">
                  <span className="text-[#8B98A5]">{sp.label}:</span>
                  <span className="text-white font-semibold">{sp.value}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {(isLongSpecs || isLongDesc) && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-[#FFC500] text-[12px] font-bold hover:underline cursor-pointer"
          >
            {expanded ? 'عرض أقل' : 'عرض المزيد'}
          </button>
        )}

        {jobImg && (
          <div className="rounded-xl overflow-hidden border border-[#2F3336]/60 max-h-52 bg-zinc-950">
            <img
              src={jobImg}
              alt={job.title}
              className="w-full max-h-52 object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-[#2F3336]/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#71767B]">
          {job.city || 'اليمن'}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FFC500] hover:bg-amber-400 text-black text-xs font-black rounded-full transition"
        >
          <span>عرض الوظيفة</span>
          <ArrowLeft size={13} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
